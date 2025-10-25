// lib/conversionEngine.ts

export interface ConversionResult {
  workflow: any;
  validation: {
    success: boolean;
    mappedSteps: number;
    unmappedSteps: number;
    warnings: string[];
    confidence: number;
  };
}

export type Platform = 'zapier' | 'n8n' | 'make';

// ==================== COMPREHENSIVE APP MAPPING ====================
const APP_MAPPING: Record<string, Record<string, string>> = {
  // Email Services
  'gmail': { zapier: 'gmail', n8n: 'n8n-nodes-base.gmail', make: 'google:gmail' },
  'outlook': { zapier: 'outlook', n8n: 'n8n-nodes-base.microsoftOutlook', make: 'microsoft365:outlook' },
  'mailchimp': { zapier: 'mailchimp', n8n: 'n8n-nodes-base.mailchimp', make: 'mailchimp' },
  'sendgrid': { zapier: 'sendgrid', n8n: 'n8n-nodes-base.sendgrid', make: 'sendgrid' },
  
  // Communication
  'slack': { zapier: 'slack', n8n: 'n8n-nodes-base.slack', make: 'slack' },
  'discord': { zapier: 'discord', n8n: 'n8n-nodes-base.discord', make: 'discord' },
  'telegram': { zapier: 'telegram', n8n: 'n8n-nodes-base.telegram', make: 'telegram' },
  'twilio': { zapier: 'twilio', n8n: 'n8n-nodes-base.twilio', make: 'twilio' },
  
  // CRM
  'salesforce': { zapier: 'salesforce', n8n: 'n8n-nodes-base.salesforce', make: 'salesforce' },
  'hubspot': { zapier: 'hubspot', n8n: 'n8n-nodes-base.hubspot', make: 'hubspot' },
  'pipedrive': { zapier: 'pipedrive', n8n: 'n8n-nodes-base.pipedrive', make: 'pipedrive' },
  
  // Project Management
  'trello': { zapier: 'trello', n8n: 'n8n-nodes-base.trello', make: 'trello' },
  'asana': { zapier: 'asana', n8n: 'n8n-nodes-base.asana', make: 'asana' },
  'jira': { zapier: 'jira', n8n: 'n8n-nodes-base.jira', make: 'jira' },
  'notion': { zapier: 'notion', n8n: 'n8n-nodes-base.notion', make: 'notion' },
  
  // Storage
  'google-drive': { zapier: 'google-drive', n8n: 'n8n-nodes-base.googleDrive', make: 'google:drive' },
  'dropbox': { zapier: 'dropbox', n8n: 'n8n-nodes-base.dropbox', make: 'dropbox' },
  
  // Databases
  'airtable': { zapier: 'airtable', n8n: 'n8n-nodes-base.airtable', make: 'airtable' },
  'google-sheets': { zapier: 'google-sheets', n8n: 'n8n-nodes-base.googleSheets', make: 'google:sheets' },
  
  // HTTP
  'webhook': { zapier: 'webhook', n8n: 'n8n-nodes-base.webhook', make: 'webhooks' },
  'http': { zapier: 'webhook', n8n: 'n8n-nodes-base.httpRequest', make: 'http' },
};

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function normalizeAppName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
}

// ==================== MAIN CONVERSION FUNCTION ====================
export function convertWorkflow(
  sourceWorkflow: any,
  sourcePlatform: Platform,
  targetPlatform: Platform
): ConversionResult {
  if (sourcePlatform === targetPlatform) {
    return {
      workflow: sourceWorkflow,
      validation: {
        success: true,
        mappedSteps: 0,
        unmappedSteps: 0,
        warnings: [],
        confidence: 100
      }
    };
  }

  const converters: Record<string, Record<string, (w: any) => ConversionResult>> = {
    zapier: { n8n: zapierToN8n, make: zapierToMake },
    n8n: { zapier: n8nToZapier, make: n8nToMake },
    make: { zapier: makeToZapier, n8n: makeToN8n },
  };

  const converter = converters[sourcePlatform]?.[targetPlatform];
  if (!converter) {
    throw new Error(`Unsupported conversion: ${sourcePlatform} to ${targetPlatform}`);
  }

  return converter(sourceWorkflow);
}

// ==================== ZAPIER TO N8N ====================
function zapierToN8n(zapierWorkflow: any): ConversionResult {
  const warnings: string[] = [];
  let mappedSteps = 0;
  let unmappedSteps = 0;

  const nodes: any[] = [];
  const connections: any = {};
  
  const steps = zapierWorkflow.steps || zapierWorkflow.actions || [];
  const trigger = zapierWorkflow.trigger;

  // Add trigger node
  if (trigger) {
    const appName = normalizeAppName(trigger.app || 'webhook');
    const n8nType = APP_MAPPING[appName]?.n8n || 'n8n-nodes-base.webhook';
    
    nodes.push({
      id: generateId(),
      name: `${trigger.app || 'Trigger'} Trigger`,
      type: n8nType,
      typeVersion: 1,
      position: [250, 300],
      parameters: trigger.config || {},
      credentials: {}
    });
    mappedSteps++;
  }

  // Add action nodes
  steps.forEach((step: any, index: number) => {
    const appName = normalizeAppName(step.app || step.type || 'custom');
    const n8nType = APP_MAPPING[appName]?.n8n || 'n8n-nodes-base.httpRequest';
    const mapped = !!APP_MAPPING[appName];
    
    const node = {
      id: generateId(),
      name: step.app ? `${step.app} ${index + 1}` : `Step ${index + 1}`,
      type: n8nType,
      typeVersion: 1,
      position: [250 + ((index + 1) * 200), 300],
      parameters: step.config || step.parameters || {},
      credentials: {}
    };

    nodes.push(node);

    // Create connections
    if (index === 0 && nodes.length > 1) {
      connections[nodes[0].name] = {
        main: [[{ node: node.name, type: 'main', index: 0 }]]
      };
    } else if (index > 0) {
      connections[nodes[index].name] = {
        main: [[{ node: node.name, type: 'main', index: 0 }]]
      };
    }

    if (mapped) {
      mappedSteps++;
    } else {
      unmappedSteps++;
      warnings.push(`App "${step.app}" mapped to generic HTTP node`);
    }
  });

  return {
    workflow: {
      name: zapierWorkflow.title || zapierWorkflow.name || "Imported from Zapier",
      nodes,
      connections,
      settings: {
        executionOrder: "v1"
      },
      staticData: null,
      tags: [],
      pinData: {},
      versionId: generateId()
    },
    validation: {
      success: true,
      mappedSteps,
      unmappedSteps,
      warnings,
      confidence: mappedSteps > 0 ? Math.round((mappedSteps / (mappedSteps + unmappedSteps)) * 100) : 100
    }
  };
}

// ==================== N8N TO ZAPIER ====================
function n8nToZapier(n8nWorkflow: any): ConversionResult {
  const warnings: string[] = [];
  let mappedSteps = 0;
  let unmappedSteps = 0;

  const nodes = n8nWorkflow.nodes || [];
  const steps: any[] = [];
  let trigger: any = null;

  nodes.forEach((node: any, index: number) => {
    const nodeTypeLower = (node.type || '').toLowerCase().replace('n8n-nodes-base.', '');
    
    // Find matching app
    let zapierApp = 'webhook';
    for (const [key, mapping] of Object.entries(APP_MAPPING)) {
      if (mapping.n8n.toLowerCase().includes(nodeTypeLower)) {
        zapierApp = mapping.zapier;
        break;
      }
    }

    const isTrigger = index === 0 || node.type.includes('trigger') || node.type.includes('webhook');

    if (isTrigger) {
      trigger = {
        app: zapierApp,
        event: node.parameters?.event || 'trigger',
        config: node.parameters || {}
      };
      mappedSteps++;
    } else {
      steps.push({
        app: zapierApp,
        action: node.parameters?.operation || node.parameters?.action || 'create',
        config: node.parameters || {}
      });
      mappedSteps++;
    }
  });

  return {
    workflow: {
      title: n8nWorkflow.name || "Imported from n8n",
      description: `Converted from n8n on ${new Date().toLocaleDateString()}`,
      trigger: trigger || { app: 'webhook', event: 'catch_hook', config: {} },
      steps,
      created_at: new Date().toISOString()
    },
    validation: {
      success: true,
      mappedSteps,
      unmappedSteps,
      warnings,
      confidence: 100
    }
  };
}

// ==================== ZAPIER TO MAKE ====================
function zapierToMake(zapierWorkflow: any): ConversionResult {
  const warnings: string[] = [];
  let mappedSteps = 0;
  let unmappedSteps = 0;

  const flow: any[] = [];
  const trigger = zapierWorkflow.trigger;
  const steps = zapierWorkflow.steps || zapierWorkflow.actions || [];

  // Add trigger
  if (trigger) {
    const appName = normalizeAppName(trigger.app || 'webhook');
    const makeModule = APP_MAPPING[appName]?.make || 'webhooks:customWebhook';
    
    flow.push({
      id: 1,
      module: makeModule,
      version: 1,
      parameters: trigger.config || {},
      mapper: {}
    });
    mappedSteps++;
  }

  // Add steps
  steps.forEach((step: any, index: number) => {
    const appName = normalizeAppName(step.app || 'http');
    const makeModule = APP_MAPPING[appName]?.make || 'http:makeRequest';
    const mapped = !!APP_MAPPING[appName];

    flow.push({
      id: index + 2,
      module: makeModule,
      version: 1,
      parameters: step.config || step.parameters || {},
      mapper: {}
    });

    if (mapped) {
      mappedSteps++;
    } else {
      unmappedSteps++;
      warnings.push(`App "${step.app}" needs configuration in Make`);
    }
  });

  return {
    workflow: {
      name: zapierWorkflow.title || "Imported from Zapier",
      flow,
      metadata: {
        version: 1,
        designer: {
          orphans: []
        }
      }
    },
    validation: {
      success: true,
      mappedSteps,
      unmappedSteps,
      warnings,
      confidence: mappedSteps > 0 ? Math.round((mappedSteps / (mappedSteps + unmappedSteps)) * 100) : 100
    }
  };
}

// ==================== N8N TO MAKE ====================
function n8nToMake(n8nWorkflow: any): ConversionResult {
  const warnings: string[] = [];
  let mappedSteps = 0;
  const nodes = n8nWorkflow.nodes || [];
  const flow: any[] = [];

  nodes.forEach((node: any, index: number) => {
    const nodeTypeLower = (node.type || '').toLowerCase().replace('n8n-nodes-base.', '');
    
    let makeModule = 'http:makeRequest';
    for (const [key, mapping] of Object.entries(APP_MAPPING)) {
      if (mapping.n8n.toLowerCase().includes(nodeTypeLower)) {
        makeModule = mapping.make || 'http:makeRequest';
        break;
      }
    }

    flow.push({
      id: index + 1,
      module: makeModule,
      version: 1,
      parameters: node.parameters || {},
      mapper: {}
    });
    mappedSteps++;
  });

  return {
    workflow: {
      name: n8nWorkflow.name || "Imported from n8n",
      flow,
      metadata: { version: 1 }
    },
    validation: {
      success: true,
      mappedSteps,
      unmappedSteps: 0,
      warnings,
      confidence: 100
    }
  };
}

// ==================== MAKE TO ZAPIER ====================
function makeToZapier(makeWorkflow: any): ConversionResult {
  const warnings: string[] = [];
  let mappedSteps = 0;
  const flow = makeWorkflow.flow || makeWorkflow.modules || [];
  const steps: any[] = [];
  let trigger: any = null;

  flow.forEach((module: any, index: number) => {
    const moduleName = (module.module || '').split(':')[0];
    
    let zapierApp = 'webhook';
    for (const [key, mapping] of Object.entries(APP_MAPPING)) {
      if (mapping.make?.includes(moduleName)) {
        zapierApp = mapping.zapier;
        break;
      }
    }

    if (index === 0) {
      trigger = {
        app: zapierApp,
        event: 'trigger',
        config: module.parameters || {}
      };
    } else {
      steps.push({
        app: zapierApp,
        action: 'create',
        config: module.parameters || {}
      });
    }
    mappedSteps++;
  });

  return {
    workflow: {
      title: makeWorkflow.name || "Imported from Make",
      trigger: trigger || { app: 'webhook', event: 'catch_hook', config: {} },
      steps
    },
    validation: {
      success: true,
      mappedSteps,
      unmappedSteps: 0,
      warnings,
      confidence: 100
    }
  };
}

// ==================== MAKE TO N8N ====================
function makeToN8n(makeWorkflow: any): ConversionResult {
  const warnings: string[] = [];
  let mappedSteps = 0;
  const flow = makeWorkflow.flow || makeWorkflow.modules || [];
  const nodes: any[] = [];
  const connections: any = {};

  flow.forEach((module: any, index: number) => {
    const moduleName = (module.module || '').split(':')[0];
    
    let n8nType = 'n8n-nodes-base.httpRequest';
    for (const [key, mapping] of Object.entries(APP_MAPPING)) {
      if (mapping.make?.includes(moduleName)) {
        n8nType = mapping.n8n;
        break;
      }
    }

    const node = {
      id: generateId(),
      name: `${moduleName} ${index + 1}`,
      type: n8nType,
      typeVersion: 1,
      position: [250 + (index * 200), 300],
      parameters: module.parameters || {},
      credentials: {}
    };

    nodes.push(node);

    if (index > 0) {
      connections[nodes[index - 1].name] = {
        main: [[{ node: node.name, type: 'main', index: 0 }]]
      };
    }
    mappedSteps++;
  });

  return {
    workflow: {
      name: makeWorkflow.name || "Imported from Make",
      nodes,
      connections,
      settings: { executionOrder: "v1" }
    },
    validation: {
      success: true,
      mappedSteps,
      unmappedSteps: 0,
      warnings,
      confidence: 100
    }
  };
}
