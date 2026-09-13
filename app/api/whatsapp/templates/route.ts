import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/whatsapp/db';
import { TemplateService } from '@/lib/whatsapp/templates';

export async function GET() {
  const templates = db.getTemplates();
  return NextResponse.json({ templates });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = TemplateService.validateTemplate(body);

    if (!validation.valid) {
      return NextResponse.json({ success: false, errors: validation.errors }, { status: 400 });
    }

    const variables = TemplateService.extractVariables(body.bodyText || '');

    const newTemplate = db.createTemplate({
      name: body.name.toLowerCase().trim(),
      category: body.category || 'MARKETING',
      language: body.language || 'en_US',
      headerType: body.headerType || 'NONE',
      headerText: body.headerText,
      bodyText: body.bodyText,
      footerText: body.footerText,
      buttons: body.buttons || [],
      variables,
      sampleValues: body.sampleValues || {}
    });

    return NextResponse.json({ success: true, template: newTemplate });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
