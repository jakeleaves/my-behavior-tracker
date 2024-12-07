import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET() {
  try {
    const auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL as string,
      undefined,
      (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    const sheets = google.sheets({ version: 'v4', auth });

    // Adjust the range to where your student names live. For example "Sheet1!A2:A" for all names starting at A2.
    const range = process.env.GOOGLE_STUDENT_LIST_RANGE || 'Sheet1!F2:F';
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID as string,
      range,
    });

    const rows = response.data.values || [];
    // rows is an array of arrays. Each element is an array representing a row.
    // If each row has just one column (the student’s name), you can map them easily.
    const students = rows.map(row => row[0]).filter(Boolean);

    return NextResponse.json({ students });
  } catch (error) {
    console.error('Error fetching student list:', error);
    return NextResponse.json({ error: 'Failed to fetch student list' }, { status: 500 });
  }
}