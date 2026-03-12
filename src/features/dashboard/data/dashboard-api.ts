import { api } from "@/lib/api";

export async function getDashboardData(workCenterId: string = 'all') {
  const response = await api.get('/dashboard', {
    params: { workCenterId }
  });
  return response.data;
}
