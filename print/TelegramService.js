// TelegramService.js - Multiple CORS proxy fallbacks
const TELEGRAM_BOT_TOKEN = "7918152804:AAEfqKOSPdTW26F1OpWBhn3onVP3pk-6Jgs";
// Ensure chat ID is properly formatted (remove any extra characters)
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
  const proxyUrl = 'http://localhost:3000/sendDocument'; // Local proxy server
  
  console.log("Attempting to send document to Telegram:", {
    name: document.name,
    type: document.type,
    size: document.size
  });
  
  // Validate document
  if (!document || !(document instanceof Blob)) {
    throw new Error("Invalid document provided. Must be a File or Blob object.");
  }
  
  // Ensure document has a name
  const fileName = document.name || `document_${Date.now()}.bin`;
  console.log("Using file name:", fileName);
  
  // Try multiple approaches
  const approaches = [
    {
      name: "Direct Upload (may be blocked by CORS)",
      fn: async () => {
        const formData = new FormData();
        formData.append('chat_id', TELEGRAM_CHAT_ID);
        formData.append('document', document, fileName);
        
        if (caption) {
          formData.append('caption', caption);
        }
        
        console.log("Trying direct upload to Telegram API...");
        const response = await fetch(baseUrl, {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        return await response.json();
      }
    },
    {
      name: "Local Proxy Server",
      fn: async () => {
        // Check if local proxy is available
        try {
          const healthCheck = await fetch('http://localhost:3000/health');
          if (!healthCheck.ok) {
            throw new Error('Proxy server not responding');
          }
        } catch (error) {
          console.log("Local proxy server not available, skipping this approach");
          throw new Error('Local proxy server not available');
        }
        
        const formData = new FormData();
        formData.append('document', document, fileName);
        formData.append('chat_id', TELEGRAM_CHAT_ID);
        
        if (caption) {
          formData.append('caption', caption);
        }
        
        console.log("Trying local proxy server...");
        const response = await fetch(proxyUrl, {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Proxy error: HTTP ${response.status}: ${errorText}`);
        }
        
        return await response.json();
      }
    }
  ];
  
  // Try each approach
  for (let i = 0; i < approaches.length; i++) {
    const approach = approaches[i];
    try {
      console.log(`Trying approach ${i + 1}/${approaches.length}: ${approach.name}`);
      const data = await approach.fn();
      
      console.log("Telegram API response:", data);
      
      if (data && data.ok) {
        console.log(`✅ Document sent successfully! Message ID: ${data.result.message_id}`);
        return data;
      } else {
        console.warn(`Approach failed:`, data.description || 'Unknown error');
        continue;
      }
    } catch (error) {
      console.warn(`Approach ${i + 1} failed:`, error.message);
      if (i === approaches.length - 1) {
        // All approaches failed
        throw new Error(`All approaches failed. Last error: ${error.message}`);
      }
    }
  }
  
  throw new Error('Failed to send document - all approaches exhausted');
}

async function sendPrintOrderToTelegram(orderData) {
  const currentDateTime = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });
  
  const { name, email, document, printOptions, file } = orderData;
  
  console.log("sendPrintOrderToTelegram called with:", { name, email, document, printOptions, file });
  
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
    
    console.log("Sending order summary file:", summaryFile);
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
      
      console.log("Sending actual document file:", file);
      await sendTelegramDocument(file, `Document from ${name} (${email})`);
      console.log("✅ Document sent successfully");
    } else {
      console.warn("⚠️ No document file provided");
    }
    
    console.log("🎉 ALL DONE! Order submitted successfully");
    return true;
    
  } catch (error) {
    console.error("❌ Error in sendPrintOrderToTelegram:", error);
    console.error("Error stack:", error.stack);
    
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
  console.log("Nodes:", nodes);
  
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
  
  console.log("Document node:", documentNode);
  console.log("Document file:", documentNode.file);
  
  // Check if file exists and is valid
  if (!documentNode.file) {
    console.error("❌ No file attached to document node");
    alert("No file was attached to the document!");
    return false;
  }
  
  console.log("File details:", {
    name: documentNode.file.name,
    size: documentNode.file.size,
    type: documentNode.file.type,
    isFile: documentNode.file instanceof File,
    isBlob: documentNode.file instanceof Blob
  });
  
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

// Export the sendTelegramDocument function for testing
export { sendTelegramDocument };
