import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { formId, label, placeholder, defaultValue, order, type, isRequired, isVisible, isEnabled, validationRules } = await req.json();
    
    // Create a new form element entry in your Neon database
    const result = await sql`
      INSERT INTO form_elements (form_id, label, placeholder, default_value, order, type, is_required, is_visible, is_enabled, validation_rules)
      VALUES (${formId}, ${label}, ${placeholder}, ${defaultValue}, ${order}, ${type}, ${isRequired}, ${isVisible}, ${isEnabled}, ${validationRules})
      RETURNING id, form_id, label, placeholder, default_value, order, type, is_required, is_visible, is_enabled, validation_rules, created_at, updated_at
    `;
    
    if (result.length === 0) {
      throw new Error('Failed to create form element');
    }
    
    return NextResponse.json({ 
      status: 'success', 
      formElement: result[0] 
    });
  } catch (error: any) {
    console.error('Form element creation error:', error);
    return NextResponse.json({ 
      status: 'error', 
      error: error.message 
    }, { status: 500 });
  }
} 