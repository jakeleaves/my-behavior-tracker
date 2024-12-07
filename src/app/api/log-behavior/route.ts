import { NextResponse } from 'next/server';
import { google } from 'googleapis';

interface LogRequestBody {
  student: string;
  date: string;
  startTime: string;
  endTime: string;
}

export async function POST(request: Request) {
  const body: LogRequestBody = await request.json();

  const { student, date, startTime, endTime } = body;

  if (!student || !date || !startTime || !endTime) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      undefined,
      (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    const sheets = google.sheets({ version: 'v4', auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: process.env.GOOGLE_SHEET_RANGE as string,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[student, date, startTime, endTime]]
      }
    });

    return NextResponse.json({ message: 'Data logged successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error logging data:', error);
    return NextResponse.json({ error: 'Failed to log data' }, { status: 500 });
  }
}