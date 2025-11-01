// Type declarations for Deno runtime and Supabase Edge Functions

declare namespace Deno {
  export namespace env {
    export function get(key: string): string | undefined;
  }
}

// Deno serve function type
declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export function serve(
    handler: (request: Request) => Response | Promise<Response>,
    options?: { port?: number }
  ): void;
}

// Supabase client type
declare module 'https://esm.sh/@supabase/supabase-js@2.38.4' {
  export function createClient(
    supabaseUrl: string,
    supabaseKey: string,
    options?: any
  ): any;
}

export {};
