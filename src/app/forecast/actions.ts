'use server';

import { salesForecasting, SalesForecastingOutput } from '@/ai/flows/ai-sales-forecasting';

type FormState = {
  data: SalesForecastingOutput | null;
  error: string | null;
};

export async function generateForecast(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const historicalSalesData = formData.get('historicalSalesData') as string;
  const marketTrends = formData.get('marketTrends') as string;
  const seasonalFactors = formData.get('seasonalFactors') as string;

  if (!historicalSalesData || !marketTrends || !seasonalFactors) {
    return { data: null, error: 'All fields are required.' };
  }

  try {
    const result = await salesForecasting({
      historicalSalesData,
      marketTrends,
      seasonalFactors,
    });
    return { data: result, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: 'Failed to generate forecast. Please try again.' };
  }
}
