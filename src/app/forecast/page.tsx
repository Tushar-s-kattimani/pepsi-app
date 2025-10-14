
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { generateForecast } from './actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BrainCircuit, Loader2, Zap, BarChart, FileText, Bot } from 'lucide-react';

const initialState = {
  data: null,
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Zap className="mr-2 h-4 w-4" />
          Generate Forecast
        </>
      )}
    </Button>
  );
}

export default function ForecastPage() {
  const [state, formAction] = useActionState(generateForecast, initialState);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
          <BrainCircuit className="w-8 h-8 text-primary" />
          AI Sales Forecast
        </h1>
        <p className="text-muted-foreground mt-1">
          Predict product demand based on historical data and market trends.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <Card className="lg:col-span-1">
          <form action={formAction}>
            <CardHeader>
              <CardTitle>Forecast Inputs</CardTitle>
              <CardDescription>
                Provide the data for the AI to generate a forecast.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="historicalSalesData">Historical Sales Data (CSV format)</Label>
                <Textarea
                  id="historicalSalesData"
                  name="historicalSalesData"
                  placeholder="E.g., date,product_id,quantity,price..."
                  rows={6}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="marketTrends">Market Trends</Label>
                <Textarea
                  id="marketTrends"
                  name="marketTrends"
                  placeholder="E.g., Increased demand for sugar-free options..."
                  rows={3}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seasonalFactors">Seasonal Factors</Label>
                <Textarea
                  id="seasonalFactors"
                  name="seasonalFactors"
                  placeholder="E.g., Higher sales during summer holidays..."
                  rows={3}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <SubmitButton />
            </CardFooter>
          </form>
        </Card>

        <div className="lg:col-span-2 space-y-8">
          {state.error && (
            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="text-destructive">An Error Occurred</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{state.error}</p>
                </CardContent>
            </Card>
          )}

          {state.data ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><BarChart className="text-primary"/>Product Demand Forecast</CardTitle>
                  <CardDescription>
                    Confidence Level: <span className="font-bold text-primary">{(state.data.confidenceLevel * 100).toFixed(0)}%</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{state.data.productDemandForecast}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><FileText className="text-primary"/>Inventory Recommendations</CardTitle>
                  <CardDescription>AI-powered suggestions for inventory optimization.</CardDescription>
                </CardHeader>
                <CardContent>
                   <p className="whitespace-pre-wrap">{state.data.recommendations}</p>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="flex flex-col items-center justify-center min-h-[400px]">
                <CardContent className="text-center space-y-4">
                    <Bot className="w-16 h-16 text-muted-foreground mx-auto" />
                    <h3 className="text-xl font-semibold font-headline">Awaiting Forecast</h3>
                    <p className="text-muted-foreground">
                        Your AI-generated forecast will appear here once you provide the inputs.
                    </p>
                </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
