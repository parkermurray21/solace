import { getAdvocateAvailability } from "../services/appointmentsService";
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const advocateIdParam = searchParams.get("advocateId");

  if (!advocateIdParam) {
    return Response.json(
      { success: false, error: "Missing advocateId" },
      { status: 400 }
    );
  }

  const advocateId = parseInt(advocateIdParam);
  if (isNaN(advocateId)) {
    return Response.json(
      { success: false, error: "Invalid advocateId" },
      { status: 400 }
    );
  }

  try {
    const availability = await getAdvocateAvailability(advocateId);
    return Response.json({ success: true, availability });
  } catch (error: any) {
    console.error("Error fetching availability:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
