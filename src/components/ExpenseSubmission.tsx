import { useState, useEffect, useRef } from "react";
import { apiClient } from "@/integrations/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, Camera, Scan, FileText, DollarSign, Calendar, Tag, Globe, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { convertCurrency, getCurrencySymbol, getSupportedCurrencies, formatCurrency, fetchCurrencyData } from "@/lib/currency";

interface Category {
  id: string;
  name: string;
}

const ExpenseSubmission = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [currencies, setCurrencies] = useState<Record<string, any>>({});
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [converting, setConverting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    amount: "",
    currency: "USD",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
    loadCurrencies();
  }, []);

  const loadCurrencies = async () => {
    const currencyData = await fetchCurrencyData();
    setCurrencies(currencyData);
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.getCategories();
      if (response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleCurrencyConversion = async () => {
    if (!formData.amount || !formData.currency) return;
    
    setConverting(true);
    try {
      const amount = parseFloat(formData.amount);
      const converted = await convertCurrency(amount, formData.currency, "USD");
      setConvertedAmount(converted);
      
      toast({
        title: "Conversion Complete",
        description: `Amount converted to USD: ${formatCurrency(converted, "USD")}`,
      });
    } catch (error) {
      toast({
        title: "Conversion Error",
        description: "Failed to convert currency. Using original amount.",
        variant: "destructive",
      });
    } finally {
      setConverting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setReceiptPreview(URL.createObjectURL(file));
      
      // Upload file to server
      try {
        setOcrProcessing(true);
        const response = await apiClient.uploadFile(file, '/expenses/receipt-upload');
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        // Process OCR results if available
        if (response.data) {
          processOcrResults(response.data.ocrData);
        }
      } catch (error: any) {
        toast({
          title: "Upload Error",
          description: error.message || "Failed to upload receipt",
          variant: "destructive",
        });
      } finally {
        setOcrProcessing(false);
      }
    }
  };

  const processOcrResults = (ocrData: any) => {
    setFormData({
      ...formData,
      amount: ocrData.amount || formData.amount,
      currency: ocrData.currency || formData.currency,
      date: ocrData.date || formData.date,
      description: ocrData.merchant ? `${ocrData.merchant} receipt` : formData.description
    });
    
    toast({
      title: "Receipt Processed",
      description: "Expense details extracted from receipt",
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const originalAmount = parseFloat(formData.amount);
      
      // For now, we'll use the same currency for both original and company currency
      // In a real app, you'd get the company's default currency from the API
      const convertedAmt = await convertCurrency(
        originalAmount,
        formData.currency,
        "USD" // Default company currency
      );

      const response = await apiClient.createExpense({
        user_id: "", // Will be set by the backend from the JWT token
        company_id: "", // Will be set by the backend
        category_id: formData.category || undefined,
        amount: convertedAmt,
        original_amount: originalAmount,
        original_currency: formData.currency,
        company_currency: "USD",
        description: formData.description,
        expense_date: formData.date,
        status: "pending",
      });

      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Success",
        description: "Expense submitted successfully",
      });

      setFormData({
        amount: "",
        currency: "USD",
        category: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
      
      setReceiptPreview(null);
      setConvertedAmount(null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Get sorted currency codes
  const getCurrencyCodes = () => {
    return Object.keys(currencies).sort();
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Submit New Expense
          </CardTitle>
          <CardDescription>Fill in the details for your expense claim</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amount" className="flex items-center">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => {
                    setFormData({ ...formData, amount: e.target.value });
                    setConvertedAmount(null); // Reset converted amount when original changes
                  }}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency" className="flex items-center">
                  <Tag className="mr-2 h-4 w-4" />
                  Currency
                </Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => {
                    setFormData({ ...formData, currency: value });
                    setConvertedAmount(null); // Reset converted amount when currency changes
                  }}
                >
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getCurrencyCodes().map((currencyCode) => (
                      <SelectItem key={currencyCode} value={currencyCode}>
                        {currencyCode} - {currencies[currencyCode]?.name || currencyCode} ({getCurrencySymbol(currencyCode)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {convertedAmount !== null && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm">
                  Converted Amount: <span className="font-bold">{formatCurrency(convertedAmount, "USD")}</span>
                </p>
              </div>
            )}

            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleCurrencyConversion}
              disabled={!formData.amount || converting}
              className="w-full"
            >
              {converting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <Globe className="mr-2 h-4 w-4" />
                  Convert to USD
                </>
              )}
            </Button>

            <div className="space-y-2">
              <Label htmlFor="category" className="flex items-center">
                <Tag className="mr-2 h-4 w-4" />
                Category
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                Expense Date
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your expense..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading || ocrProcessing}>
              {loading ? "Submitting..." : "Submit Expense"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Scan className="mr-2 h-5 w-5" />
              Receipt Upload
            </CardTitle>
            <CardDescription>Upload a receipt for automatic expense extraction</CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={triggerFileInput}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
              />
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 font-medium">Upload Receipt</p>
              <p className="text-sm text-muted-foreground mt-2">
                Drag and drop or click to upload a receipt image or PDF
              </p>
              <Button 
                variant="secondary" 
                className="mt-4" 
                onClick={triggerFileInput}
                disabled={ocrProcessing}
              >
                {ocrProcessing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Camera className="mr-2 h-4 w-4" />
                    Select File
                  </>
                )}
              </Button>
            </div>
            
            {ocrProcessing && (
              <Alert className="mt-4">
                <Scan className="h-4 w-4" />
                <AlertTitle>Processing Receipt</AlertTitle>
                <AlertDescription>
                  Extracting expense details from your receipt...
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {receiptPreview && (
          <Card>
            <CardHeader>
              <CardTitle>Receipt Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <img 
                  src={receiptPreview} 
                  alt="Receipt preview" 
                  className="w-full h-auto max-h-64 object-contain"
                />
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>AI-Powered Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <Scan className="h-4 w-4 text-primary mt-0.5 mr-2 flex-shrink-0" />
                <span>Automatic receipt scanning and data extraction</span>
              </li>
              <li className="flex items-start">
                <DollarSign className="h-4 w-4 text-primary mt-0.5 mr-2 flex-shrink-0" />
                <span>Fraud detection for duplicate receipts</span>
              </li>
              <li className="flex items-start">
                <Tag className="h-4 w-4 text-primary mt-0.5 mr-2 flex-shrink-0" />
                <span>Smart categorization of expenses</span>
              </li>
              <li className="flex items-start">
                <Calendar className="h-4 w-4 text-primary mt-0.5 mr-2 flex-shrink-0" />
                <span>Policy compliance checking</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExpenseSubmission;