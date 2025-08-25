import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, score, detailedResults } = await request.json();

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1f2937; margin-bottom: 10px;">Résultats Test Designer - Numilex</h1>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #374151; margin: 0 0 10px 0;">Candidat: ${firstName} ${lastName}</h2>
            <div style="font-size: 36px; font-weight: bold; color: ${score.percentage >= 70 ? '#16a34a' : score.percentage >= 50 ? '#eab308' : '#dc2626'}; margin: 10px 0;">
              ${score.percentage}%
            </div>
            <p style="color: #6b7280; margin: 0; font-size: 18px;">
              ${score.correct} / ${score.total} réponses correctes
            </p>
            <p style="color: #6b7280; margin: 10px 0 0 0;">
              Date: ${new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
        
        <div style="margin-top: 30px;">
          <h3 style="color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
            Détail des Réponses
          </h3>
          ${detailedResults}
        </div>
        
        <div style="margin-top: 30px; padding: 20px; background: #f9fafb; border-radius: 8px; text-align: center;">
          <p style="color: #6b7280; margin: 0; font-size: 14px;">
            Ce rapport a été généré automatiquement par le système de test Numilex
          </p>
        </div>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'louenes.abbas@numilex.com',
      subject: `Résultats Test Designer - ${firstName} ${lastName}`,
      html: `${emailHtml}`,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
