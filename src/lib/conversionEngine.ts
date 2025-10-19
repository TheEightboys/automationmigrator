type Platform = 'zapier' | 'n8n' | 'make';

interface ConversionResult {
  platform: Platform;
  workflow: any;
  validation: {
    success: boolean;
    warnings: string[];
    mappedSteps: number;
    unmappedSteps: number;
  };
}

// Enhanced app mappings with n8n node types
const appMappings: Record<string, Record<Platform, string>> = {
  'telegram': {
    'zapier': 'Telegram',
    'n8n': 'n8n-nodes-base.telegram',
    'make': 'Telegram',
  },
  'telegram-trigger': {
    'zapier': 'Telegram (Trigger)',
    'n8n': 'n8n-nodes-base.telegramTrigger',
    'make': 'Telegram (Webhook)',
  },
  'gmail': {
    'zapier': 'Gmail',
    'n8n': 'n8n-nodes-base.gmail',
    'make': 'Gmail',
  },
  'slack': {
    'zapier': 'Slack',
    'n8n': 'n8n-nodes-base.slack',
    'make': 'Slack',
  },
  'google-sheets': {
    'zapier': 'Google Sheets',
    'n8n': 'n8n-nodes-base.googleSheets',
    'make': 'Google Sheets',
  },
  'hubspot': {
    'zapier': 'HubSpot',
    'n8n': 'n8n-nodes-base.hubspot',
    'make': 'HubSpot',
  },
  'mailchimp': {
    'zapier': 'Mailchimp',
    'n8n': 'n8n-nodes-base.mailchimp',
    'make': 'Mailchimp',
  },
  'webhook': {
    'zapier': 'Webhooks by Zapier',
    'n8n': 'n8n-nodes-base.webhook',
    'make': 'HTTP',
  },
  'http-request': {
    'zapier': 'Webhooks by Zapier',
    'n8n': 'n8n-nodes-base.httpRequest',
    'make': 'HTTP',
  },
  'code': {
    'zapier': 'Code by Zapier',
    'n8n': 'n8n-nodes-base.code',
    'make': 'Code',
  },
  'ai-google-gemini': {
    'zapier': 'Google Gemini AI',
    'n8n': '@n8n/n8n-nodes-langchain.googleGemini',
    'make': 'Google AI',
  },
};

export const convertWorkflow = (
  sourceWorkflow: any,
  sourcePlatform: Platform,
  targetPlatform: Platform
): ConversionResult => {
  const warnings: string[] = [];
  let mappedSteps = 0;
  let unmappedSteps = 0;

  let convertedWorkflow: any;

  if (sourcePlatform === 'zapier' && targetPlatform === 'n8n') {
    convertedWorkflow = convertZapierToN8n(sourceWorkflow, warnings, (mapped) => {
      if (mapped) mappedSteps++;
      else unmappedSteps++;
    });
  } else if (sourcePlatform === 'zapier' && targetPlatform === 'make') {
    convertedWorkflow = convertZapierToMake(sourceWorkflow, warnings, (mapped) => {
      if (mapped) mappedSteps++;
      else unmappedSteps++;
    });
  } else if (sourcePlatform === 'n8n' && targetPlatform === 'zapier') {
    convertedWorkflow = convertN8nToZapier(sourceWorkflow, warnings, (mapped) => {
      if (mapped) mappedSteps++;
      else unmappedSteps++;
    });
  } else if (sourcePlatform === 'n8n' && targetPlatform === 'make') {
    convertedWorkflow = convertN8nToMake(sourceWorkflow, warnings, (mapped) => {
      if (mapped) mappedSteps++;
      else unmappedSteps++;
    });
  } else if (sourcePlatform === 'make' && targetPlatform === 'zapier') {
    convertedWorkflow = convertMakeToZapier(sourceWorkflow, warnings, (mapped) => {
      if (mapped) mappedSteps++;
      else unmappedSteps++;
    });
  } else if (sourcePlatform === 'make' && targetPlatform === 'n8n') {
    convertedWorkflow = convertMakeToN8n(sourceWorkflow, warnings, (mapped) => {
      if (mapped) mappedSteps++;
      else unmappedSteps++;
    });
  } else {
    convertedWorkflow = sourceWorkflow;
    warnings.push('Direct conversion not implemented for this platform pair');
  }

  return {
    platform: targetPlatform,
    workflow: convertedWorkflow,
    validation: {
      success: unmappedSteps === 0 && warnings.length === 0,
      warnings,
      mappedSteps,
      unmappedSteps,
    },
  };
};

const convertZapierToN8n = (
  zapierWorkflow: any,
  warnings: string[],
  onStep: (mapped: boolean) => void
): any => {
  const n8nWorkflow: any = {
    name: zapierWorkflow.title || 'Imported Workflow',
    nodes: [],
    connections: {},
    active: false,
    settings: {
      executionOrder: 'v1',
    },
    pinData: {},
    versionId: generateId(),
    id: generateId(),
    tags: [],
  };

  const steps = zapierWorkflow.steps || [];
  
  steps.forEach((step: any, index: number) => {
    const appKey = step.app?.toLowerCase().replace(/\s+/g, '-');
    const mappedApp = appMappings[appKey || '']?.['n8n'];

    if (mappedApp) {
      const nodeId = generateId();
      const node: any = {
        id: nodeId,
        name: step.label || `${step.app} ${index + 1}`,
        type: mappedApp,
        typeVersion: 1,
        position: [250 * index, 300],
        parameters: convertZapierParamsToN8n(step.params || {}, mappedApp),
      };

      // Add credentials if needed
      if (step.authentication) {
        node.credentials = {
          [getCredentialType(mappedApp)]: {
            id: generateId(),
            name: step.authentication.name || 'Account',
          },
        };
      }

      n8nWorkflow.nodes.push(node);

      // Create connections
      if (index > 0) {
        const prevNode = n8nWorkflow.nodes[index - 1];
        if (!n8nWorkflow.connections[prevNode.name]) {
          n8nWorkflow.connections[prevNode.name] = { main: [[]] };
        }
        n8nWorkflow.connections[prevNode.name].main[0].push({
          node: node.name,
          type: 'main',
          index: 0,
        });
      }

      onStep(true);
    } else {
      warnings.push(`Unable to map app: ${step.app} (${appKey})`);
      onStep(false);
    }
  });

  return n8nWorkflow;
};

const convertZapierToMake = (
  zapierWorkflow: any,
  warnings: string[],
  onStep: (mapped: boolean) => void
): any => {
  const makeWorkflow: any = {
    name: zapierWorkflow.title || 'Imported Workflow',
    flow: [],
    metadata: {
      version: 1,
      scenario: {
        roundtrips: 1,
        maxErrors: 3,
        autoCommit: true,
        sequential: false,
      },
    },
  };

  const steps = zapierWorkflow.steps || [];
  steps.forEach((step: any, index: number) => {
    const appKey = step.app?.toLowerCase().replace(/\s+/g, '-');
    const mappedApp = appMappings[appKey || '']?.['make'];

    if (mappedApp) {
      makeWorkflow.flow.push({
        id: index + 1,
        module: mappedApp,
        version: 1,
        parameters: convertZapierParamsToMake(step.params || {}),
        mapper: step.mapping || {},
        metadata: {
          designer: {
            x: index * 300,
            y: 0,
          },
          restore: {},
          parameters: [],
        },
      });
      onStep(true);
    } else {
      warnings.push(`Unable to map app: ${step.app}`);
      onStep(false);
    }
  });

  return makeWorkflow;
};

const convertN8nToZapier = (
  n8nWorkflow: any,
  warnings: string[],
  onStep: (mapped: boolean) => void
): any => {
  const zapierWorkflow: any = {
    title: n8nWorkflow.name || 'Imported Workflow',
    description: 'Converted from n8n workflow',
    steps: [],
  };

  const nodes = n8nWorkflow.nodes || [];
  
  nodes.forEach((node: any, index: number) => {
    // Extract the base node type (handle both formats)
    const nodeType = node.type?.replace('n8n-nodes-base.', '').replace('@n8n/n8n-nodes-langchain.', '');
    
    // Find matching app in mappings
    let mappedApp = null;
    let foundKey = null;
    
    for (const [key, platforms] of Object.entries(appMappings)) {
      if (platforms['n8n'] === node.type) {
        mappedApp = platforms['zapier'];
        foundKey = key;
        break;
      }
    }

    if (mappedApp) {
      const step: any = {
        id: index + 1,
        app: mappedApp,
        event: determineZapierEvent(node),
        label: node.name || mappedApp,
        params: convertN8nParamsToZapier(node.parameters || {}, node.type),
      };

      // Add authentication if credentials exist
      if (node.credentials) {
        const credKey = Object.keys(node.credentials)[0];
        step.authentication = {
          type: credKey,
          name: node.credentials[credKey]?.name || 'Account',
        };
      }

      zapierWorkflow.steps.push(step);
      onStep(true);
    } else {
      warnings.push(`Unable to map n8n node type: ${node.type} (${nodeType})`);
      onStep(false);
    }
  });

  return zapierWorkflow;
};

const convertN8nToMake = (
  n8nWorkflow: any,
  warnings: string[],
  onStep: (mapped: boolean) => void
): any => {
  const makeWorkflow: any = {
    name: n8nWorkflow.name || 'Imported Workflow',
    flow: [],
    metadata: {
      version: 1,
      scenario: {
        roundtrips: 1,
        maxErrors: 3,
        autoCommit: true,
        sequential: false,
      },
    },
  };

  const nodes = n8nWorkflow.nodes || [];
  
  nodes.forEach((node: any, index: number) => {
    let mappedApp = null;
    
    for (const [key, platforms] of Object.entries(appMappings)) {
      if (platforms['n8n'] === node.type) {
        mappedApp = platforms['make'];
        break;
      }
    }

    if (mappedApp) {
      makeWorkflow.flow.push({
        id: index + 1,
        module: mappedApp,
        version: 1,
        parameters: node.parameters || {},
        mapper: {},
        metadata: {
          designer: {
            x: node.position?.[0] || index * 300,
            y: node.position?.[1] || 0,
          },
          restore: {},
          parameters: [],
        },
      });
      onStep(true);
    } else {
      warnings.push(`Unable to map node: ${node.type}`);
      onStep(false);
    }
  });

  return makeWorkflow;
};

const convertMakeToZapier = (
  makeWorkflow: any,
  warnings: string[],
  onStep: (mapped: boolean) => void
): any => {
  const zapierWorkflow: any = {
    title: makeWorkflow.name || 'Imported Workflow',
    steps: [],
  };

  const flow = makeWorkflow.flow || [];
  
  flow.forEach((module: any, index: number) => {
    const moduleType = module.module?.toLowerCase().replace(/\s+/g, '-');
    
    let mappedApp = null;
    for (const [key, platforms] of Object.entries(appMappings)) {
      if (platforms['make']?.toLowerCase() === moduleType) {
        mappedApp = platforms['zapier'];
        break;
      }
    }

    if (mappedApp) {
      zapierWorkflow.steps.push({
        id: index + 1,
        app: mappedApp,
        label: module.metadata?.designer?.name || mappedApp,
        params: module.parameters || {},
        mapping: module.mapper || {},
      });
      onStep(true);
    } else {
      warnings.push(`Unable to map module: ${module.module}`);
      onStep(false);
    }
  });

  return zapierWorkflow;
};

const convertMakeToN8n = (
  makeWorkflow: any,
  warnings: string[],
  onStep: (mapped: boolean) => void
): any => {
  const n8nWorkflow: any = {
    name: makeWorkflow.name || 'Imported Workflow',
    nodes: [],
    connections: {},
    active: false,
    settings: {
      executionOrder: 'v1',
    },
    pinData: {},
    versionId: generateId(),
    id: generateId(),
    tags: [],
  };

  const flow = makeWorkflow.flow || [];
  
  flow.forEach((module: any, index: number) => {
    const moduleType = module.module?.toLowerCase().replace(/\s+/g, '-');
    
    let mappedApp = null;
    for (const [key, platforms] of Object.entries(appMappings)) {
      if (platforms['make']?.toLowerCase() === moduleType) {
        mappedApp = platforms['n8n'];
        break;
      }
    }

    if (mappedApp) {
      const node: any = {
        id: generateId(),
        name: module.metadata?.designer?.name || `${module.module} ${index + 1}`,
        type: mappedApp,
        typeVersion: 1,
        position: [
          module.metadata?.designer?.x || 250 * index,
          module.metadata?.designer?.y || 300,
        ],
        parameters: module.parameters || {},
      };

      n8nWorkflow.nodes.push(node);

      // Create connections
      if (index > 0) {
        const prevNode = n8nWorkflow.nodes[index - 1];
        if (!n8nWorkflow.connections[prevNode.name]) {
          n8nWorkflow.connections[prevNode.name] = { main: [[]] };
        }
        n8nWorkflow.connections[prevNode.name].main[0].push({
          node: node.name,
          type: 'main',
          index: 0,
        });
      }

      onStep(true);
    } else {
      warnings.push(`Unable to map module: ${module.module}`);
      onStep(false);
    }
  });

  return n8nWorkflow;
};

// Helper functions
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function getCredentialType(nodeType: string): string {
  const credentialMap: Record<string, string> = {
    'n8n-nodes-base.telegram': 'telegramApi',
    'n8n-nodes-base.telegramTrigger': 'telegramApi',
    'n8n-nodes-base.gmail': 'gmailOAuth2',
    'n8n-nodes-base.slack': 'slackOAuth2',
    'n8n-nodes-base.googleSheets': 'googleSheetsOAuth2',
    '@n8n/n8n-nodes-langchain.googleGemini': 'googlePalmApi',
  };
  return credentialMap[nodeType] || 'default';
}

function determineZapierEvent(node: any): string {
  if (node.type?.includes('Trigger') || node.type?.includes('trigger')) {
    return 'trigger';
  }
  return 'action';
}

function convertN8nParamsToZapier(params: any, nodeType: string): any {
  // Handle specific n8n parameter formats and convert to Zapier format
  const converted: any = {};
  
  for (const [key, value] of Object.entries(params)) {
    // Remove n8n expression syntax (={{ }})
    if (typeof value === 'string' && value.startsWith('={{') && value.endsWith('}}')) {
      converted[key] = value.slice(3, -2).trim();
    } else if (typeof value === 'object' && value !== null) {
      converted[key] = convertN8nParamsToZapier(value, nodeType);
    } else {
      converted[key] = value;
    }
  }
  
  return converted;
}

function convertZapierParamsToN8n(params: any, nodeType: string): any {
  const converted: any = {};
  
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'object' && value !== null) {
      converted[key] = convertZapierParamsToN8n(value, nodeType);
    } else {
      converted[key] = value;
    }
  }
  
  return converted;
}

function convertZapierParamsToMake(params: any): any {
  return params; // Make uses similar structure to Zapier
}
