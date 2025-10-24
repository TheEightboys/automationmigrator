// lib/conversionEngine.ts

export interface ConversionResult {
  workflow: any;
  validation: {
    success: boolean;
    mappedSteps: number;
    unmappedSteps: number;
    warnings: string[];
    confidence: number; // 0-100
  };
}

export type Platform = 'zapier' | 'n8n' | 'make';

// Comprehensive app mapping database
const APP_MAPPING: Record<string, Record<string, string>> = {
  // Email apps
  'gmail': { zapier: 'gmail', n8n: 'n8n-nodes-base.gmail', make: 'google:gmail' },
  'outlook': { zapier: 'outlook', n8n: 'n8n-nodes-base.microsoft-outlook', make: 'microsoft365:outlook' },
  'sendgrid': { zapier: 'sendgrid', n8n: 'n8n-nodes-base.sendgrid', make: 'sendgrid' },
  'mailchimp': { zapier: 'mailchimp', n8n: 'n8n-nodes-base.mailchimp', make: 'mailchimp' },
  
  // Communication
  'slack': { zapier: 'slack', n8n: 'n8n-nodes-base.slack', make: 'slack' },
  'discord': { zapier: 'discord', n8n: 'n8n-nodes-base.discord', make: 'discord' },
  'telegram': { zapier: 'telegram', n8n: 'n8n-nodes-base.telegram', make: 'telegram' },
  'twilio': { zapier: 'twilio', n8n: 'n8n-nodes-base.twilio', make: 'twilio' },
  
  // CRM
  'salesforce': { zapier: 'salesforce', n8n: 'n8n-nodes-base.salesforce', make: 'salesforce' },
  'hubspot': { zapier: 'hubspot', n8n: 'n8n-nodes-base.hubspot', make: 'hubspot' },
  'pipedrive': { zapier: 'pipedrive', n8n: 'n8n-nodes-base.pipedrive', make: 'pipedrive' },
  'zoho-crm': { zapier: 'zoho-crm', n8n: 'n8n-nodes-base.zoho-crm', make: 'zoho:crm' },
  
  // Project Management
  'trello': { zapier: 'trello', n8n: 'n8n-nodes-base.trello', make: 'trello' },
  'asana': { zapier: 'asana', n8n: 'n8n-nodes-base.asana', make: 'asana' },
  'jira': { zapier: 'jira', n8n: 'n8n-nodes-base.jira', make: 'jira' },
  'monday': { zapier: 'monday', n8n: 'n8n-nodes-base.mondayCom', make: 'monday' },
  'notion': { zapier: 'notion', n8n: 'n8n-nodes-base.notion', make: 'notion' },
  
  // Databases
  'airtable': { zapier: 'airtable', n8n: 'n8n-nodes-base.airtable', make: 'airtable' },
  'google-sheets': { zapier: 'google-sheets', n8n: 'n8n-nodes-base.googleSheets', make: 'google:sheets' },
  'mysql': { zapier: 'mysql', n8n: 'n8n-nodes-base.mySql', make: 'mysql' },
  'postgres': { zapier: 'postgresql', n8n: 'n8n-nodes-base.postgres', make: 'postgresql' },
  'mongodb': { zapier: 'mongodb', n8n: 'n8n-nodes-base.mongoDb', make: 'mongodb' },
  
  // Storage
  'google-drive': { zapier: 'google-drive', n8n: 'n8n-nodes-base.googleDrive', make: 'google:drive' },
  'dropbox': { zapier: 'dropbox', n8n: 'n8n-nodes-base.dropbox', make: 'dropbox' },
  'onedrive': { zapier: 'onedrive', n8n: 'n8n-nodes-base.microsoft-one-drive', make: 'microsoft365:onedrive' },
  
  // Payment
  'stripe': { zapier: 'stripe', n8n: 'n8n-nodes-base.stripe', make: 'stripe' },
  'paypal': { zapier: 'paypal', n8n: 'n8n-nodes-base.paypal', make: 'paypal' },
  'square': { zapier: 'square', n8n: 'n8n-nodes-base.square', make: 'square' },
  
  // Social Media
  'twitter': { zapier: 'twitter', n8n: 'n8n-nodes-base.twitter', make: 'twitter' },
  'facebook': { zapier: 'facebook', n8n: 'n8n-nodes-base.facebookGraphApi', make: 'facebook' },
  'instagram': { zapier: 'instagram', n8n: 'n8n-nodes-base.instagram', make: 'instagram' },
  'linkedin': { zapier: 'linkedin', n8n: 'n8n-nodes-base.linkedIn', make: 'linkedin' },
  
  // Development
  'github': { zapier: 'github', n8n: 'n8n-nodes-base.github', make: 'github' },
  'gitlab': { zapier: 'gitlab', n8n: 'n8n-nodes-base.gitlab', make: 'gitlab' },
  'webhook': { zapier: 'webhook', n8n: 'n8n-nodes-base.webhook', make: 'webhooks' },
  'http': { zapier: 'webhook', n8n: 'n8n-nodes-base.httpRequest', make: 'http' },
  
  // Calendar
  'google-calendar': { zapier: 'google-calendar', n8n: 'n8n-nodes-base.googleCalendar', make: 'google:calendar' },
  'outlook-calendar': { zapier: 'office-365-calendar', n8n: 'n8n-nodes-base.microsoft-outlook', make: 'microsoft365:calendar' },
  
  // E-commerce
  'shopify': { zapier: 'shopify', n8n: 'n8n-nodes-base.shopify', make: 'shopify' },
  'woocommerce': { zapier: 'woocommerce', n8n: 'n8n-nodes-base.wooCommerce', make: 'woocommerce' },
  'magento': { zapier: 'magento', n8n: 'n8n-nodes-base.magento2', make: 'magento' },
  
  // Productivity
  'evernote': { zapier: 'evernote', n8n: 'n8n-nodes-base.evernote', make: 'evernote' },
  'todoist': { zapier: 'todoist', n8n: 'n8n-nodes-base.todoist', make: 'todoist' },
  'zoom': { zapier: 'zoom', n8n: 'n8n-nodes-base.zoom', make: 'zoom' },
};

// Action mapping
const ACTION_MAPPING: Record<string, Record<string, string>> = {
  'create': { zapier: 'create', n8n: 'create', make: 'createModule' },
  'update': { zapier: 'update', n8n: 'update', make: 'updateModule' },
  'delete': { zapier: 'delete', n8n: 'delete', make: 'deleteModule' },
  'get': { zapier: 'find', n8n: 'get', make: 'getModule' },
  'search': { zapier: 'search', n8n: 'getAll', make: 'searchModule' },
  'send': { zapier: 'send', n8n: 'send', make: 'sendModule' },
};

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

  const converters: Record<string, Record<string, (workflow: any) => ConversionResult>> = {
    zapier: {
      n8n: zapierToN8n,
      make: zapierToMake,
    },
    n8n: {
      zapier: n8nToZapier,
      make: n8nToMake,
    },
    make: {
      zapier: makeToZapier,
      n8n: makeToN8n,
    },
  };

  const converter = converters[sourcePlatform]?.[targetPlatform];
  if (!converter) {
    throw new Error(`Conversion from ${sourcePlatform} to ${targetPlatform} is not supported`);
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
  let yPosition = 300;

  // Convert trigger
  if (zapierWorkflow.trigger) {
    const triggerNode = convertZapierTriggerToN8n(zapierWorkflow.trigger, 0, yPosition);
    if (triggerNode.mapped) {
      nodes.push(triggerNode.node);
      mappedSteps++;
    } else {
      unmappedSteps++;
      warnings.push(`Trigger "${zapierWorkflow.trigger.app}" could not be fully mapped`);
    }
  }

  // Convert steps/actions
  const steps = zapierWorkflow.steps || zapierWorkflow.actions || [];
  steps.forEach((step: any, index: number) => {
    const nodeResult = convertZapierStepToN8n(step, index + 1, yPosition);
    nodes.push(nodeResult.node);
    
    if (nodeResult.mapped) {
      mappedSteps++;
    } else {
      unmappedSteps++;
      warnings.push(`Step "${step.app || step.type}" may need manual configuration`);
    }

    // Create connections
    if (index === 0 && nodes.length > 1) {
      connections[nodes[0].name] = { main: [[{ node: nodeResult.node.name, type: 'main', index: 0 }]] };
    } else if (index > 0) {
      connections[nodes[index].name] = { main: [[{ node: nodeResult.node.name, type: 'main', index: 0 }]] };
    }

    yPosition += 100;
  });

  const confidence = mappedSteps > 0 ? Math.round((mappedSteps / (mappedSteps + unmappedSteps)) * 100) : 0;

  return {
    workflow: {
      name: zapierWorkflow.title || zapierWorkflow.name || "Imported Workflow",
      nodes,
      connections,
      settings: {
        executionOrder: "v1"
      },
      staticData: null,
      tags: [],
      meta: {
        imported: true,
        importedFrom: "zapier",
        importedAt: new Date().toISOString()
      }
    },
    validation: {
      success: unmappedSteps === 0,
      mappedSteps,
      unmappedSteps,
      warnings,
      confidence
    }
  };
}

function convertZapierTriggerToN8n(trigger: any, index: number, yPos: number) {
  const normalizedApp = normalizeAppName(trigger.app || trigger.type);
  const n8nNodeType = APP_MAPPING[normalizedApp]?.n8n || 'n8n-nodes-base.webhook';
  const mapped = !!APP_MAPPING[normalizedApp];

  return {
    node: {
      id: generateId(),
      name: `${trigger.app || 'Trigger'} ${index}`,
      type: n8nNodeType,
      typeVersion: 1,
      position: [250, yPos],
      parameters: convertZapierParamsToN8n(trigger.config || trigger.parameters || {}),
      credentials: {}
    },
    mapped
  };
}

function convertZapierStepToN8n(step: any, index: number, yPos: number) {
  const normalizedApp = normalizeAppName(step.app || step.type);
  const n8nNodeType = APP_MAPPING[normalizedApp]?.n8n || 'n8n-nodes-base.httpRequest';
  const mapped = !!APP_MAPPING[normalizedApp];

  return {
    node: {
      id: generateId(),
      name: `${step.app || 'Step'} ${index}`,
      type: n8nNodeType,
      typeVersion: 1,
      position: [250 + (index * 200), yPos],
      parameters: convertZapierParamsToN8n(step.config || step.parameters || {}),
      credentials: {}
    },
    mapped
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
    const normalizedType = normalizeN8nType(node.type);
    const zapierApp = getZapierAppFromN8n(normalizedType);
    
    if (index === 0 || node.type.includes('trigger') || node.type.includes('webhook')) {
      trigger = {
        app: zapierApp.app,
        event: node.parameters?.event || 'catch_hook',
        config: convertN8nParamsToZapier(node.parameters || {})
      };
      mappedSteps++;
    } else {
      steps.push({
        app: zapierApp.app,
        action: zapierApp.action || 'create',
        config: convertN8nParamsToZapier(node.parameters || {})
      });
      
      if (zapierApp.mapped) {
        mappedSteps++;
      } else {
        unmappedSteps++;
        warnings.push(`Node "${node.name}" may require manual configuration in Zapier`);
      }
    }
  });

  const confidence = mappedSteps > 0 ? Math.round((mappedSteps / (mappedSteps + unmappedSteps)) * 100) : 0;

  return {
    workflow: {
      title: n8nWorkflow.name || "Imported Workflow",
      description: `Imported from n8n on ${new Date().toLocaleDateString()}`,
      trigger,
      steps,
      created_at: new Date().toISOString()
    },
    validation: {
      success: unmappedSteps === 0,
      mappedSteps,
      unmappedSteps,
      warnings,
      confidence
    }
  };
}

// ==================== ZAPIER TO MAKE ====================
function zapierToMake(zapierWorkflow: any): ConversionResult {
  const warnings: string[] = [];
  let mappedSteps = 0;
  let unmappedSteps = 0;

  const flow: any[] = [];

  // Convert trigger
  if (zapierWorkflow.trigger) {
    const makeModule = convertZapierTriggerToMake(zapierWorkflow.trigger, 1);
    flow.push(makeModule.module);
    if (makeModule.mapped) mappedSteps++;
    else unmappedSteps++;
  }

  // Convert steps
  const steps = zapierWorkflow.steps || zapierWorkflow.actions || [];
  steps.forEach((step: any, index: number) => {
    const makeModule = convertZapierStepToMake(step, index + 2);
    flow.push(makeModule.module);
    
    if (makeModule.mapped) {
      mappedSteps++;
    } else {
      unmappedSteps++;
      warnings.push(`Step "${step.app}" needs manual configuration in Make`);
    }
  });

  const confidence = mappedSteps > 0 ? Math.round((mappedSteps / (mappedSteps + unmappedSteps)) * 100) : 0;

  return {
    workflow: {
      name: zapierWorkflow.title || "Imported Workflow",
      flow,
      metadata: {
        version: 1,
        imported: true,
        importedFrom: "zapier"
      }
    },
    validation: {
      success: unmappedSteps === 0,
      mappedSteps,
      unmappedSteps,
      warnings,
      confidence
    }
  };
}

function convertZapierTriggerToMake(trigger: any, id: number) {
  const normalizedApp = normalizeAppName(trigger.app || trigger.type);
  const makeModule = APP_MAPPING[normalizedApp]?.make || 'webhooks:customWebhook';
  const mapped = !!APP_MAPPING[normalizedApp];

  return {
    module: {
      id,
      module: makeModule,
      version: 1,
      parameters: convertZapierParamsToMake(trigger.config || {}),
      mapper: {}
    },
    mapped
  };
}

function convertZapierStepToMake(step: any, id: number) {
  const normalizedApp = normalizeAppName(step.app || step.type);
  const makeModule = APP_MAPPING[normalizedApp]?.make || 'http:makeRequest';
  const mapped = !!APP_MAPPING[normalizedApp];

  return {
    module: {
      id,
      module: makeModule,
      version: 1,
      parameters: convertZapierParamsToMake(step.config || {}),
      mapper: {}
    },
    mapped
  };
}

// ==================== N8N TO MAKE ====================
function n8nToMake(n8nWorkflow: any): ConversionResult {
  const warnings: string[] = [];
  let mappedSteps = 0;
  let unmappedSteps = 0;

  const flow: any[] = [];
  const nodes = n8nWorkflow.nodes || [];

  nodes.forEach((node: any, index: number) => {
    const normalizedType = normalizeN8nType(node.type);
    const makeApp = getMakeAppFromN8n(normalizedType);
    
    flow.push({
      id: index + 1,
      module: makeApp.module,
      version: 1,
      parameters: convertN8nParamsToMake(node.parameters || {}),
      mapper: {}
    });

    if (makeApp.mapped) {
      mappedSteps++;
    } else {
      unmappedSteps++;
      warnings.push(`Node "${node.name}" may need manual setup in Make`);
    }
  });

  const confidence = mappedSteps > 0 ? Math.round((mappedSteps / (mappedSteps + unmappedSteps)) * 100) : 0;

  return {
    workflow: {
      name: n8nWorkflow.name || "Imported Workflow",
      flow,
      metadata: {
        version: 1,
        imported: true,
        importedFrom: "n8n"
      }
    },
    validation: {
      success: unmappedSteps === 0,
      mappedSteps,
      unmappedSteps,
      warnings,
      confidence
    }
  };
}

// ==================== MAKE TO ZAPIER ====================
function makeToZapier(makeWorkflow: any): ConversionResult {
  const warnings: string[] = [];
  let mappedSteps = 0;
  let unmappedSteps = 0;

  const flow = makeWorkflow.flow || makeWorkflow.modules || [];
  const steps: any[] = [];
  let trigger: any = null;

  flow.forEach((module: any, index: number) => {
    const zapierApp = getZapierAppFromMake(module.module);
    
    if (index === 0) {
      trigger = {
        app: zapierApp.app,
        event: 'trigger',
        config: convertMakeParamsToZapier(module.parameters || {})
      };
      mappedSteps++;
    } else {
      steps.push({
        app: zapierApp.app,
        action: zapierApp.action || 'create',
        config: convertMakeParamsToZapier(module.parameters || {})
      });
      
      if (zapierApp.mapped) {
        mappedSteps++;
      } else {
        unmappedSteps++;
        warnings.push(`Module "${module.module}" needs review in Zapier`);
      }
    }
  });

  const confidence = mappedSteps > 0 ? Math.round((mappedSteps / (mappedSteps + unmappedSteps)) * 100) : 0;

  return {
    workflow: {
      title: makeWorkflow.name || "Imported Workflow",
      trigger,
      steps
    },
    validation: {
      success: unmappedSteps === 0,
      mappedSteps,
      unmappedSteps,
      warnings,
      confidence
    }
  };
}

// ==================== MAKE TO N8N ====================
function makeToN8n(makeWorkflow: any): ConversionResult {
  const warnings: string[] = [];
  let mappedSteps = 0;
  let unmappedSteps = 0;

  const nodes: any[] = [];
  const connections: any = {};
  const flow = makeWorkflow.flow || makeWorkflow.modules || [];

  flow.forEach((module: any, index: number) => {
    const n8nNode = getN8nNodeFromMake(module.module);
    
    const node = {
      id: generateId(),
      name: `${module.module.split(':')[0]} ${index + 1}`,
      type: n8nNode.type,
      typeVersion: 1,
      position: [250 + (index * 200), 300],
      parameters: convertMakeParamsToN8n(module.parameters || {}),
      credentials: {}
    };

    nodes.push(node);

    if (n8nNode.mapped) {
      mappedSteps++;
    } else {
      unmappedSteps++;
      warnings.push(`Module "${module.module}" requires configuration in n8n`);
    }

    // Create connections
    if (index > 0) {
      connections[nodes[index - 1].name] = {
        main: [[{ node: node.name, type: 'main', index: 0 }]]
      };
    }
  });

  const confidence = mappedSteps > 0 ? Math.round((mappedSteps / (mappedSteps + unmappedSteps)) * 100) : 0;

  return {
    workflow: {
      name: makeWorkflow.name || "Imported Workflow",
      nodes,
      connections,
      settings: { executionOrder: "v1" }
    },
    validation: {
      success: unmappedSteps === 0,
      mappedSteps,
      unmappedSteps,
      warnings,
      confidence
    }
  };
}

// ==================== HELPER FUNCTIONS ====================

function normalizeAppName(app: string): string {
  return app.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
}

function normalizeN8nType(type: string): string {
  return type.replace('n8n-nodes-base.', '').toLowerCase();
}

function getZapierAppFromN8n(n8nType: string) {
  for (const [key, mapping] of Object.entries(APP_MAPPING)) {
    if (mapping.n8n === `n8n-nodes-base.${n8nType}` || mapping.n8n.toLowerCase().includes(n8nType)) {
      return { app: mapping.zapier, mapped: true, action: 'create' };
    }
  }
  return { app: n8nType, mapped: false, action: 'create' };
}

function getZapierAppFromMake(makeModule: string) {
  const [app] = makeModule.split(':');
  for (const [key, mapping] of Object.entries(APP_MAPPING)) {
    if (mapping.make?.includes(app)) {
      return { app: mapping.zapier, mapped: true, action: 'create' };
    }
  }
  return { app, mapped: false, action: 'create' };
}

function getMakeAppFromN8n(n8nType: string) {
  for (const [key, mapping] of Object.entries(APP_MAPPING)) {
    if (mapping.n8n === `n8n-nodes-base.${n8nType}`) {
      return { module: mapping.make || 'http:makeRequest', mapped: true };
    }
  }
  return { module: 'http:makeRequest', mapped: false };
}

function getN8nNodeFromMake(makeModule: string) {
  const [app] = makeModule.split(':');
  for (const [key, mapping] of Object.entries(APP_MAPPING)) {
    if (mapping.make?.includes(app)) {
      return { type: mapping.n8n, mapped: true };
    }
  }
  return { type: 'n8n-nodes-base.httpRequest', mapped: false };
}

function convertZapierParamsToN8n(params: any): any {
  return { ...params };
}

function convertN8nParamsToZapier(params: any): any {
  return { ...params };
}

function convertZapierParamsToMake(params: any): any {
  return { ...params };
}

function convertN8nParamsToMake(params: any): any {
  return { ...params };
}

function convertMakeParamsToZapier(params: any): any {
  return { ...params };
}

function convertMakeParamsToN8n(params: any): any {
  return { ...params };
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
  