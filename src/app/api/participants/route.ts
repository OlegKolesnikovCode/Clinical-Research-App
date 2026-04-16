//This is the Next.js API route handler that talks to the postgreSQL database via Prisma.

import { NextResponse } from "next/server"; //Used to send responses back to the client
import { prisma } from "@/lib/prisma"; //Your database client for reading inserting updating and deleting rows 


//GET → read data when someone sends a GET request to /api/participants
export async function GET() {
  const participants = await prisma.participant.findMany({
    orderBy: { createdAt: "desc" },
  });

  /*
  Equivelent to SQL query:
  SELECT * FROM Participant
  ORDER BY createdAt DESC;
  */

  return NextResponse.json(participants); //Sends JSON back to the browser
}

//POST → create data when someone enteres data on the frontend
export async function POST(req: Request) {

  const body = await req.json(); //Converts incoming JSON into a JS object

  const { name, age, condition } = body;

  //Validation  - Checks for missing data
  if (!name || !age || !condition) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }
  //Insert into database
  const participant = await prisma.participant.create({
    data: {
      name,
      age: Number(age),
      condition,
    },

    /*
      Prisma translates above post request into SQL.
      Equivelent to:
      INTO Participant (name, age, condition)
      VALUES ('Oleg', 25, 'Study A')
      RETURNING *; 
    */
  });

  return NextResponse.json(participant, { status: 201 });
}