'use server';
/**
 * @fileOverview Implements an AI-powered sales forecasting tool.
 *
 * - salesForecasting - A function that forecasts product demand based on historical data, market trends, and seasonality.
 * - SalesForecastingInput - The input type for the salesForecasting function.
 * - SalesForecastingOutput - The return type for the salesForecasting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SalesForecastingInputSchema = z.object({
  historicalSalesData: z.string().describe('Historical sales data in CSV format.'),
  marketTrends: z.string().describe('Description of current market trends.'),
  seasonalFactors: z.string().describe('Description of seasonal factors affecting sales.'),
});
export type SalesForecastingInput = z.infer<typeof SalesForecastingInputSchema>;

const SalesForecastingOutputSchema = z.object({
  productDemandForecast: z.string().describe('A forecast of product demand.'),
  confidenceLevel: z.number().describe('The confidence level of the forecast (0-1).'),
  recommendations: z.string().describe('Recommendations for optimizing inventory levels based on the forecast.'),
});
export type SalesForecastingOutput = z.infer<typeof SalesForecastingOutputSchema>;

export async function salesForecasting(input: SalesForecastingInput): Promise<SalesForecastingOutput> {
  return salesForecastingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'salesForecastingPrompt',
  input: {schema: SalesForecastingInputSchema},
  output: {schema: SalesForecastingOutputSchema},
  prompt: `You are an AI sales forecasting expert. Analyze the provided data and generate a product demand forecast.

Historical Sales Data: {{{historicalSalesData}}}

Market Trends: {{{marketTrends}}}

Seasonal Factors: {{{seasonalFactors}}}

Based on this information, provide a product demand forecast, a confidence level for the forecast, and recommendations for optimizing inventory levels.

Ensure that the productDemandForecast is an explainable forecast and the recommendations are concrete.

Output the results in the following JSON format:

{
  "productDemandForecast": "forecast",
  "confidenceLevel": 0.9,
  "recommendations": "recommendations"
}
`,
});

const salesForecastingFlow = ai.defineFlow(
  {
    name: 'salesForecastingFlow',
    inputSchema: SalesForecastingInputSchema,
    outputSchema: SalesForecastingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
