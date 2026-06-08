import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/api-proxy";

export const GET = async (req: NextRequest) => await proxyRequest(req);
export const POST = async (req: NextRequest) => await proxyRequest(req);
export const PUT = async (req: NextRequest) => await proxyRequest(req);
export const PATCH = async (req: NextRequest) => await proxyRequest(req);
export const DELETE = async (req: NextRequest) => await proxyRequest(req);
