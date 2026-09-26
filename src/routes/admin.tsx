import { createFileRoute, Navigate } from '@tanstack/react-router';

export const Route = createFileRoute('/admin')({
  component: AdminRoute,
});

function AdminRoute() {
  return <Navigate to="/painel" replace />;
}
