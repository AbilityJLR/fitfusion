export async function POST(request) {
  try {
    const userData = await request.json();
    console.log('Next.js API route: Registration request received:', { 
      ...userData, 
      password: '[REDACTED]' 
    });

    // Use the server name as defined in docker-compose
    const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://server:8000';
    const apiUrl = `${serverUrl}/api/v1/users/`;

    console.log('Next.js API route: Forwarding request to:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      console.error('Next.js API route: Registration failed with status:', response.status);
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      return Response.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('Next.js API route: Registration successful');
    return Response.json(data);
  } catch (error) {
    console.error('Next.js API route: Error during registration:', error.message);
    return Response.json(
      { detail: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
} 