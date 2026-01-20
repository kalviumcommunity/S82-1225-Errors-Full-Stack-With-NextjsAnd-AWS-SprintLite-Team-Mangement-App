/**
 * Component Barrel Exports
 *
 * This file provides centralized imports for all components,
 * making it easier to import multiple components from a single location.
 *
 * Usage:
 * import { Header, Button, Card } from "@/components";
 *
 * Instead of:
 * import Header from "@/components/layout/Header";
 * import Button from "@/components/ui/Button";
 * import Card from "@/components/ui/Card";
 */

// Layout Components
export { default as Header } from "./layout/Header";
export { default as Sidebar } from "./layout/Sidebar";
export { default as LayoutWrapper } from "./layout/LayoutWrapper";

// UI Components
export { default as Button } from "./ui/Button";
export { default as Card } from "./ui/Card";
export { default as Input } from "./ui/Input";
