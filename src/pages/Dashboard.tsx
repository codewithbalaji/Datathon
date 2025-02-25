import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TrendingUp, PackageSearch, AlertCircle } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import axios from 'axios'
import { useState, FormEvent } from 'react'

interface PredictionFormData {
  date: string;
  daily_sales_percentage: number;
  market_share: number;
  political: number;
  marketing: number;
  budget: number;
  machineries: string;
  region: string;
}

interface PredictionResponse {
  predicted_quantity: number;
  safety_stock: number;
  reorder_point: number;
  inventory_suggestion: string;
}

export default function Dashboard() {
  const [formData, setFormData] = useState<PredictionFormData>({
    date: "",
    daily_sales_percentage: 0,
    market_share: 0,
    political: 0,
    marketing: 0,
    budget: 0,
    machineries: "",
    region: ""
  })

  const [predictionResult, setPredictionResult] = useState<PredictionResponse | null>(null)
  const [predictionHistory, setPredictionHistory] = useState<Array<{
    date: string;
    predicted: number;
    reorder: number;
    safety: number;
  }>>([])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await axios.post('https://web-production-c948.up.railway.app/predict', formData)
      console.log('Response:', response.data)
      
      setPredictionResult(response.data)
      setPredictionHistory(prev => [...prev, {
        date: formData.date,
        predicted: response.data.predicted_quantity,
        reorder: response.data.reorder_point,
        safety: response.data.safety_stock
      }])
    } catch (error) {
      console.error('Error making prediction:', error)
      alert('Failed to make prediction. Please try again.')
    }
  }

  return (
    <div className="p-6 space-y-6 bg-background">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Predicted Quantity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {predictionResult?.predicted_quantity.toFixed(2) || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Predicted units needed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Safety Stock</CardTitle>
            <PackageSearch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {predictionResult?.safety_stock.toFixed(2) || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Minimum stock level</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reorder Point</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {predictionResult?.reorder_point.toFixed(2) || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {predictionResult?.inventory_suggestion || 'No suggestion yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Prediction Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={predictionHistory}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-sm"
                  tickFormatter={(value) => new Date(value).toLocaleDateString()} 
                />
                <YAxis className="text-sm" />
                <Tooltip 
                  formatter={(value: number) => value.toFixed(2)}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Line 
                  name="Predicted Quantity" 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2} 
                  dot={true} 
                />
                <Line 
                  name="Reorder Point" 
                  type="monotone" 
                  dataKey="reorder" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2} 
                  dot={true} 
                />
                <Line 
                  name="Safety Stock" 
                  type="monotone" 
                  dataKey="safety" 
                  stroke="hsl(var(--secondary))" 
                  strokeWidth={2} 
                  dot={true} 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Predict</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input 
                  id="date" 
                  type="date" 
                  required
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    date: e.target.value 
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dailySales">Daily Sales Percentage</Label>
                <Input 
                  id="dailySales" 
                  type="number" 
                  placeholder="Enter Daily Sales (e.g., 0.034)" 
                  min="0" 
                  max="1" 
                  step="0.000001"
                  required
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    daily_sales_percentage: parseFloat(e.target.value) 
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="marketShare">Market Share</Label>
                <Input 
                  id="marketShare" 
                  type="number" 
                  placeholder="Enter Market Share" 
                  min="0" 
                  max="100" 
                  step="1"
                  required
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    market_share: parseInt(e.target.value) 
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="political">Political Factor</Label>
                <Input 
                  id="political" 
                  type="number" 
                  placeholder="Enter 0 or 1" 
                  min="0" 
                  max="1"
                  step="1"
                  required
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    political: parseInt(e.target.value) 
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="marketing">Marketing Factor</Label>
                <Input 
                  id="marketing" 
                  type="number" 
                  placeholder="Enter 0 or 1" 
                  min="0" 
                  max="1"
                  step="1"
                  required
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    marketing: parseInt(e.target.value) 
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">Budget</Label>
                <Input 
                  id="budget" 
                  type="number" 
                  placeholder="Enter Budget Amount" 
                  min="0" 
                  step="0.01"
                  required
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    budget: parseFloat(e.target.value) 
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="machineries">Machineries</Label>
                <Input 
                  id="machineries" 
                  placeholder="Enter Machinery Type" 
                  required
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    machineries: e.target.value 
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Input 
                  id="region" 
                  placeholder="Enter Region" 
                  required
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    region: e.target.value 
                  })}
                />
              </div>
              <Button type="submit" className="w-full">Predict</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

