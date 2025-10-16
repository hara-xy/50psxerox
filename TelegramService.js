// TelegramService.js - Multiple CORS proxy fallbacks
const TELEGRAM_BOT_TOKEN = "7918152804:AAEfqKOSPdTW26F1OpWBhn3onVP3pk-6Jgs";
const TELEGRAM_CHAT_ID = "-4795407436";

// Multiple CORS proxies to try (in order of reliability)
const CORS_PROXIES = [
  "https://corsproxy.io/?",
  "https://api.codetabs.com/v1/proxy?quest=",
  "https://api.allorigins.win/raw?url=",
  "" // Last resort: try direct (will fail in most browsers but worth trying)
];

let currentProxyIndex = 0;

async function sendTelegramMessage(message) {
  const baseUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  for (let i = 0; i < CORS_PROXIES.length; i++) {
    const proxy = CORS_PROXIES[i];
    const url = proxy + encodeURIComponent(baseUrl);
    
    try {
      console.log(`Trying proxy ${i + 1}/${CORS_PROXIES.length}: ${proxy || 'direct'}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown'
        })
      });
      
      if (!response.ok) {
        console.warn(`Proxy ${i + 1} failed with status: ${response.status}`);
        continue;
      }
      
      const data = await response.json();
      console.log(`✅ Success with proxy ${i + 1}:`, data);
      
      // Check if there was an error in the response
      if (!data.ok) {
        console.error('Telegram API error:', data.description);
        throw new Error(data.description || 'Telegram API returned an error');
      }
      
      currentProxyIndex = i; // Remember working proxy
      return data;
      
    } catch (error) {
      console.warn(`Proxy ${i + 1} error:`, error.message);
      if (i === CORS_PROXIES.length - 1) {
        throw error; // All proxies failed
      }
    }
  }
  
  throw new Error('All CORS proxies failed');
}

async function sendTelegramDocument(document, caption = "") {
  const baseUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`;
  
  // Try direct upload first (most reliable for file uploads)
  try {
    console.log("Trying direct document upload (bypassing CORS proxies for better compatibility)");
    
    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_CHAT_ID);
    formData.append('document', document, document.name);
    
    if (caption) {
      formData.append('caption', caption);
    }
    
    const response = await fetch(baseUrl, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Direct upload failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`📥 Document API Response:`, JSON.stringify(data, null, 2));
    
    // Check if there was an error in the response
    if (data && !data.ok) {
      console.error('❌ Telegram API error:', data.description);
      console.error('Error code:', data.error_code);
      throw new Error(data.description || 'Telegram API returned an error');
    }
    
    if (!data || !data.result) {
      console.warn('⚠️ Unexpected response format:', data);
    } else {
      console.log(`✅ Document sent successfully - Message ID: ${data.result.message_id}`);
    }
    
    return data;
    
  } catch (error) {
    console.warn("Direct document upload failed:", error.message);
    
    // If direct upload fails, try with CORS proxies as fallback
    console.log("Trying CORS proxy fallbacks...");
    
    const proxyOrder = [
      ...CORS_PROXIES.slice(currentProxyIndex),
      ...CORS_PROXIES.slice(0, currentProxyIndex)
    ];
    
    for (let i = 0; i < proxyOrder.length; i++) {
      const proxy = proxyOrder[i];
      
      // Skip empty proxy (direct) since we already tried that
      if (!proxy) continue;
      
      const url = proxy + encodeURIComponent(baseUrl);
      
      try {
        console.log(`Trying document upload via CORS proxy ${i + 1}/${proxyOrder.length}: ${proxy}`);
        
        // For CORS proxies with file uploads, we need special handling
        // Convert file to base64 and send as JSON (Telegram accepts this format)
        const base64Data = await fileToBase64(document);
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            document: `attach://${document.name}`, // Special identifier for file uploads
            caption: caption
          })
        });
        
        if (!response.ok) {
          console.warn(`CORS proxy ${i + 1} failed with status: ${response.status}`);
          continue;
        }
        
        const data = await response.json();
        console.log(`📥 Document API Response (proxy):`, JSON.stringify(data, null, 2));
        
        if (data && !data.ok) {
          console.error('❌ Telegram API error (proxy):', data.description);
          continue;
        }
        
        if (!data || !data.result) {
          console.warn('⚠️ Unexpected response format (proxy):', data);
        } else {
          console.log(`✅ Document sent successfully via proxy - Message ID: ${data.result.message_id}`);
        }
        
        return data;
        
      } catch (proxyError) {
        console.warn(`CORS proxy ${i + 1} error:`, proxyError.message);
        continue;
      }
    }
    
    // If all proxies fail, try one more direct approach without FormData
    console.log("Trying alternative direct approach...");
    try {
      const base64Data = await fileToBase64(document);
      
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          document: `data:${document.type};base64,${base64Data}`,
          caption: caption
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Document sent successfully via alternative method`);
        return data;
      }
    } catch (altError) {
      console.warn("Alternative direct approach also failed:", altError.message);
    }
    
    throw new Error('Failed to send document via all methods. This is likely due to CORS restrictions. Try deploying to a web server or using a browser without CORS restrictions.');
  }
}

// Helper function to convert file to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove the data URL prefix (e.g., "data:image/png;base64,")
      const base64Data = reader.result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = error => reject(error);
  });
}

async function sendPrintOrderToTelegram(orderData) {
  const currentDateTime = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });
  
  const { name, email, document, printOptions, file } = orderData;
  
  const message = [
    `🖨️ *50psxerox Print Order*`,
    ``,
    `*Customer:* ${name}`,
    `*Email:* ${email}`,
    `*Date:* ${currentDateTime}`,
    ``,
    `📄 *Document Details*`,
    `*File:* ${document.name}`,
    `*Pages:* ${document.pages}`,
    `*Size:* ${document.size}`,
    ``,
    `🖨️ *Print Options*`,
    `*Copies:* ${printOptions.copies}`,
    `*Color:* ${printOptions.color}`,
    `*Paper Size:* ${printOptions.paperSize}`,
  ].join("\n");
  
  try {
    // Step 1: Send message
    console.log("📤 Step 1: Sending order message...");
    await sendTelegramMessage(message);
    console.log("✅ Order message sent successfully");
    
    // Step 2: Send order summary as JSON file
    console.log("📤 Step 2: Sending order summary...");
    const orderSummary = {
      customer: { name, email },
      document: document,
      printOptions: printOptions,
      timestamp: currentDateTime
    };
    
    const summaryBlob = new Blob(
      [JSON.stringify(orderSummary, null, 2)], 
      { type: 'application/json' }
    );
    const summaryFile = new File(
      [summaryBlob], 
      `order_${Date.now()}.json`, 
      { type: 'application/json' }
    );
    
    await sendTelegramDocument(summaryFile, `Order summary from ${name}`);
    console.log("✅ Order summary sent successfully");
    
    // Step 3: Send actual document
    if (file) {
      console.log("📤 Step 3: Sending document file...");
      console.log("📋 File details:", {
        name: file.name,
        type: file.type,
        size: file.size,
        sizeInMB: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
      });
      
      // Telegram has a 50MB limit for bots
      if (file.size > 50 * 1024 * 1024) {
        console.error("❌ File too large! Telegram bot limit is 50MB");
        alert("File is too large. Telegram bots can only send files up to 50MB.");
        return false;
      }
      
      await sendTelegramDocument(file, `Document from ${name} (${email})`);
      console.log("✅ Document sent successfully");
    } else {
      console.warn("⚠️ No document file provided");
    }
    
    console.log("🎉 ALL DONE! Order submitted successfully");
    return true;
    
  } catch (error) {
    console.error("❌ Error in sendPrintOrderToTelegram:", error);
    
    // Show helpful error message
    if (error.message.includes('CORS') || error.message.includes('fetch')) {
      console.error(`
╔════════════════════════════════════════════════════════════╗
║  CORS ERROR - Browser Security Restriction                 ║
╠════════════════════════════════════════════════════════════╣
║  Your browser is blocking the request due to CORS policy.  ║
║                                                             ║
║  SOLUTIONS:                                                 ║
║  1. Deploy to a hosting service (GitHub Pages, Netlify)    ║
║  2. Use a browser extension like "CORS Unblock"            ║
║  3. Run Chrome with: --disable-web-security flag           ║
║  4. Set up a simple backend proxy (recommended)            ║
╚════════════════════════════════════════════════════════════╝
      `);
    }
    
    return false;
  }
}

// Main export function
export async function sendWorkflowToTelegram(name, email, nodes, edges, groups) {
  console.log("🚀 Starting workflow submission...");
  console.log("Customer:", name, email);
  
  const documentNode = nodes.find(n => n.type === 'document');
  const printOptionsNode = nodes.find(n => n.type === 'print-options');
  
  if (!documentNode) {
    console.error("❌ No document node found");
    alert("Please upload a document first!");
    return false;
  }
  
  if (!printOptionsNode) {
    console.error("❌ No print options node found");
    alert("Print options are missing!");
    return false;
  }
  
  const orderData = {
    name: name,
    email: email,
    document: {
      name: documentNode.data.label,
      pages: documentNode.data.pages,
      size: documentNode.data.size
    },
    printOptions: {
      copies: printOptionsNode.data.copies,
      color: printOptionsNode.data.color,
      paperSize: printOptionsNode.data.paperSize
    },
    file: documentNode.file
  };
  
  console.log("📦 Order data prepared:", orderData);
  
  const result = await sendPrintOrderToTelegram(orderData);
  
  if (result) {
    console.log("🎉 Order submitted successfully!");
  } else {
    console.error("💥 Order submission failed - check console for details");
  }
  
  return result;
}