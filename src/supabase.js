import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://lmrwyoajzoqrvputofyb.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxtcnd5b2Fqem9xcnZwdXRvZnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNTMyMzMsImV4cCI6MjA2MzkyOTIzM30.CCzwLVKM6zjVRbMo6ACJ-zUyywy5f1tcLmZetEpZZb8"
);
