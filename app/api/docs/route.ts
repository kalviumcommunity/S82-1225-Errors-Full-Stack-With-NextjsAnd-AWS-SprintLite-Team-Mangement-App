/**
 * API Documentation Route
 * Serves OpenAPI/Swagger documentation
 * 
 * Endpoint: /api/docs
 * Method: GET
 * Returns: OpenAPI specification JSON
 */

import { swaggerDocs } from '@/lib/swagger';

export async function GET() {
  return Response.json(swaggerDocs, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
