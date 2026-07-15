import { useEffect } from "react";
import { useLocation } from "wouter";

// Re-export the one from components since we updated Video to read from query params
// Actually we need to modify Video.tsx to read URL from query string. Let me do that now.
// I'll rewrite Video.tsx completely to handle `?url=...`
