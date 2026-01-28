/**
 * Loader function to fetch meetings data for Dashboard
 * Used with React Router's useLoaderData
 */
export const dashboardLoader = async () => {
  const API_URL = "http://localhost:8000";
  try {
    const response = await fetch(`${API_URL}/api/v1/get_all_meetings`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.json();
  } catch (error) {
    console.error("Failed to load meetings:", error);
    // Return empty array on error to prevent breaking the page
    return [];
  }
};
