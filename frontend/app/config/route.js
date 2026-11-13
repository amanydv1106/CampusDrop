export async function GET() {
  return Response.json({
    signalingServer: "campus-drop-signaling.onrender.com",
    buttons: {},
  });
}
