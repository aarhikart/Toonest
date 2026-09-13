import { MessageTemplate, Contact } from './types';

export class TemplateService {
  /**
   * Extract variable placeholders e.g. {{1}}, {{2}} from template text
   */
  static extractVariables(text: string): string[] {
    const matches = text.match(/\{\{(\d+)\}\}/g) || [];
    const vars = new Set<string>();
    for (const m of matches) {
      const num = m.replace(/\{|\}/g, '');
      vars.add(num);
    }
    return Array.from(vars).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  }

  /**
   * Render template body with actual values or contact data
   */
  static renderBody(
    template: MessageTemplate,
    variables: Record<string, string>,
    contact?: Contact
  ): string {
    let text = template.bodyText;

    // Replace variables {{1}}, {{2}}...
    for (const [key, val] of Object.entries(variables)) {
      text = text.replace(new RegExp(`\\{\\\{${key}\\\}\\\}`, 'g'), val);
    }

    // Default fallbacks if contact is provided
    if (contact) {
      text = text.replace(/\{\{name\}\}/gi, contact.firstName || 'Customer');
      text = text.replace(/\{\{phone\}\}/gi, contact.phoneNumber);
    }

    return text;
  }

  /**
   * Validate WhatsApp Template syntax rules
   */
  static validateTemplate(template: Partial<MessageTemplate>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!template.name || !/^[a-z0-9_]{1,512}$/.test(template.name)) {
      errors.push('Template name must be lowercase letters, numbers, and underscores only (max 512 chars)');
    }

    if (!template.bodyText || template.bodyText.trim().length === 0) {
      errors.push('Template body text is required');
    } else if (template.bodyText.length > 1024) {
      errors.push('Template body text cannot exceed 1024 characters');
    }

    if (template.headerText && template.headerText.length > 60) {
      errors.push('Template header text cannot exceed 60 characters');
    }

    if (template.footerText && template.footerText.length > 60) {
      errors.push('Template footer text cannot exceed 60 characters');
    }

    if (template.buttons && template.buttons.length > 3) {
      errors.push('WhatsApp allows a maximum of 3 quick-reply or call-to-action buttons');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
