import { useState } from "react";
import {
  Package,
  Upload,
  Barcode,
  FileText,
  DollarSign,
  Settings,
  Plus,
  Trash2,
  Save,
  X,
  ChevronRight,
  Check,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Textarea } from "@/app/components/ui/textarea";
import { Switch } from "@/app/components/ui/switch";
import { Separator } from "@/app/components/ui/separator";
import { Badge } from "@/app/components/ui/badge";

export default function App() {
  const [attachments, setAttachments] = useState<File[]>([]);
  const [barcodes, setBarcodes] = useState<string[]>([""]);
  const [variants, setVariants] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState({
    name: "",
    nameSecondLanguage: "",
    code: "",
    language: "",
    noteType: "",
    description: "",
    stockType: "",
    gstCode: "",
    egsCode: "",
    model: "",
    version: "",
    country: "",
    supplier: "",
    manufacturer: "",
    packUnits: "",
    partsCount: "",
    equals: "",
    unit: "",
    lastCost: "",
    avgCost: "",
    defaultSales: false,
    defaultPurchase: false,
    basedOnSellingPrice: false,
    discountType: "",
    maxDiscount: "",
    customerDiscount: "",
    defaultDiscount: "",
  });

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files) {
      setAttachments([
        ...attachments,
        ...Array.from(e.target.files),
      ]);
    }
  };

  const addBarcode = () => {
    setBarcodes([...barcodes, ""]);
  };

  const removeBarcode = (index: number) => {
    setBarcodes(barcodes.filter((_, i) => i !== index));
  };

  const updateBarcode = (index: number, value: string) => {
    const newBarcodes = [...barcodes];
    newBarcodes[index] = value;
    setBarcodes(newBarcodes);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">
                    Create New Product
                  </h1>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Add a new product to your inventory
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 gap-2"
              >
                <Save className="w-4 h-4" />
                Save Product
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="bg-white p-1.5 rounded-xl shadow-sm border border-gray-200">
            <TabsTrigger
              value="basic"
              className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
            >
              <Package className="w-4 h-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger
              value="codes"
              className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
            >
              <Barcode className="w-4 h-4" />
              Codes & Barcodes
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
            >
              <FileText className="w-4 h-4" />
              Product Details
            </TabsTrigger>
            <TabsTrigger
              value="pricing"
              className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
            >
              <DollarSign className="w-4 h-4" />
              Pricing & Discounts
            </TabsTrigger>
            <TabsTrigger
              value="variants"
              className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
            >
              <Settings className="w-4 h-4" />
              Variants
            </TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter product name"
                      value={formData.name}
                      onChange={(e) =>
                        updateFormData("name", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Name Second Language
                    </Label>
                    <Input
                      id="nameSecondLanguage"
                      placeholder="Enter name second language"
                      value={formData.nameSecondLanguage}
                      onChange={(e) =>
                        updateFormData(
                          "nameSecondLanguage",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Code</Label>
                    <Input
                      id="code"
                      placeholder="001"
                      value={formData.code}
                      onChange={(e) =>
                        updateFormData("code", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="note-type">Node Type</Label>
                    <Select>
                      <SelectTrigger id="node-type">
                        <SelectValue
                          placeholder="Select type"
                          value={formData.noteType}
                          onChange={(e) =>
                            updateFormData(
                              "noteType",
                              e.target.value,
                            )
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="domain">
                          Domain
                        </SelectItem>
                        <SelectItem value="category">
                          Category
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Product Attachments</CardTitle>
                <CardDescription>
                  Upload images, documents, or other files
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, PDF up to 10MB
                    </p>
                  </div>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button asChild variant="outline">
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Files
                    </label>
                  </Button>
                </div>
                {attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="text-sm text-gray-700">
                          {file.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setAttachments(
                              attachments.filter(
                                (_, i) => i !== index,
                              ),
                            )
                          }
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Codes & Barcodes Tab */}
          <TabsContent value="codes" className="space-y-6">
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Product Codes</CardTitle>
                <CardDescription>
                  Manage product identification codes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="stock-type">
                      Stock Type
                    </Label>
                    <Select>
                      <SelectTrigger id="stock-type">
                        <SelectValue
                          placeholder="Select type"
                          value={formData.stockType}
                          onChange={(e) =>
                            updateFormData(
                              "stockType",
                              e.target.value,
                            )
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stock">
                          Stock
                        </SelectItem>
                        <SelectItem value="service">
                          Service
                        </SelectItem>
                        <SelectItem value="bundle">
                          Bundle
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gst-code">GST Code</Label>
                    <Input
                      id="gst-code"
                      placeholder="Enter GST code"
                      value={formData.gstCode}
                      onChange={(e) =>
                        updateFormData(
                          "gstCode",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="egs-code">EGS Code</Label>
                    <Input
                      id="egs-code"
                      placeholder="Enter EGS code"
                      value={formData.egsCode}
                      onChange={(e) =>
                        updateFormData(
                          "egsCode",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Barcodes</CardTitle>
                    <CardDescription>
                      Add multiple barcodes for this product
                    </CardDescription>
                  </div>
                  <Button onClick={addBarcode} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Barcode
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {barcodes.map((barcode, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3"
                  >
                    <div className="flex-1">
                      <Input
                        value={barcode}
                        onChange={(e) =>
                          updateBarcode(index, e.target.value)
                        }
                        placeholder="Enter barcode"
                      />
                    </div>
                    {barcodes.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBarcode(index)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Product Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Product Specifications</CardTitle>
                <CardDescription>
                  Technical and manufacturing details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      placeholder="Enter model number"
                      value={formData.model}
                      onChange={(e) =>
                        updateFormData("model", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="version">Version</Label>
                    <Input
                      id="version"
                      placeholder="Enter version"
                      value={formData.version}
                      onChange={(e) =>
                        updateFormData(
                          "version",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="country">
                      Country of Origin
                    </Label>
                    <Select>
                      <SelectTrigger id="country">
                        <SelectValue
                          placeholder="Select country"
                          value={formData.country}
                          onChange={(e) =>
                            updateFormData(
                              "country",
                              e.target.value,
                            )
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">
                          United States
                        </SelectItem>
                        <SelectItem value="cn">
                          China
                        </SelectItem>
                        <SelectItem value="de">
                          Germany
                        </SelectItem>
                        <SelectItem value="jp">
                          Japan
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplier">Suppliers</Label>
                    <Select>
                      <SelectTrigger id="supplier">
                        <SelectValue
                          placeholder="Select supplier"
                          value={formData.supplier}
                          onChange={(e) =>
                            updateFormData(
                              "supplier",
                              e.target.value,
                            )
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="supplier1">
                          Supplier 1
                        </SelectItem>
                        <SelectItem value="supplier2">
                          Supplier 2
                        </SelectItem>
                        <SelectItem value="supplier3">
                          Supplier 3
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manufacturer">
                    Manufacturer Companies
                  </Label>
                  <Select>
                    <SelectTrigger id="manufacturer">
                      <SelectValue
                        placeholder="Select manufacturer"
                        value={formData.manufacturer}
                        onChange={(e) =>
                          updateFormData(
                            "manufacturer",
                            e.target.value,
                          )
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mfg1">
                        Manufacturer 1
                      </SelectItem>
                      <SelectItem value="mfg2">
                        Manufacturer 2
                      </SelectItem>
                      <SelectItem value="mfg3">
                        Manufacturer 3
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">
                    Packing Information
                  </h4>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pack-units">
                        Packing Units
                      </Label>
                      <Input
                        id="pack-units"
                        type="number"
                        placeholder="0"
                        value={formData.packUnits}
                        onChange={(e) =>
                          updateFormData(
                            "packUnits",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parts-count">
                        Parts Count
                      </Label>
                      <Input
                        id="parts-count"
                        type="number"
                        placeholder="0"
                        value={formData.partsCount}
                        onChange={(e) =>
                          updateFormData(
                            "partsCount",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="equals">Equals</Label>
                      <Input
                        id="equals"
                        type="number"
                        placeholder="0"
                        value={formData.equals}
                        onChange={(e) =>
                          updateFormData(
                            "equals",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">Unit</Label>
                      <Select>
                        <SelectTrigger id="unit">
                          <SelectValue
                            placeholder="Select"
                            value={formData.unit}
                            onChange={(e) =>
                              updateFormData(
                                "unit",
                                e.target.value,
                              )
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pcs">
                            Pieces
                          </SelectItem>
                          <SelectItem value="kg">
                            Kilograms
                          </SelectItem>
                          <SelectItem value="box">
                            Box
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>Default Prices</CardTitle>
                  <CardDescription>
                    Set standard pricing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="last-cost">
                      Last Cost Price
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <Input
                        id="last-cost"
                        type="number"
                        className="pl-7"
                        placeholder="0.00"
                        value={formData.lastCost}
                        onChange={(e) =>
                          updateFormData(
                            "lastCost",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="avg-cost">
                      Average Cost Price
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <Input
                        id="avg-cost"
                        type="number"
                        className="pl-7"
                        placeholder="0.00"
                        value={formData.avgCost}
                        onChange={(e) =>
                          updateFormData(
                            "avgCost",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>Sales Configuration</CardTitle>
                  <CardDescription>
                    Default sales settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Default Sales Item</Label>
                      <p className="text-sm text-gray-500">
                        Use as default in sales
                      </p>
                    </div>
                    <Switch
                      checked={formData.defaultSales}
                      onCheckedChange={(checked) =>
                        updateFormData("defaultSales", checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Default Purchase Item</Label>
                      <p className="text-sm text-gray-500">
                        Use as default in purchases
                      </p>
                    </div>
                    <Switch
                      checked={formData.defaultPurchase}
                      onCheckedChange={(checked) =>
                        updateFormData(
                          "defaultPurchase",
                          checked,
                        )
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Discount Settings</CardTitle>
                <CardDescription>
                  Configure discount rules for this product
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-0.5">
                        <Label>Based on Selling Price</Label>
                        <p className="text-sm text-gray-500">
                          Calculate from selling price
                        </p>
                      </div>
                      <Switch
                        checked={formData.basedOnSellingPrice}
                        onCheckedChange={(checked) =>
                          updateFormData(
                            "basedOnSellingPrice",
                            checked,
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="discount-type">
                        Discount Type
                      </Label>
                      <Select>
                        <SelectTrigger id="discount-type">
                          <SelectValue
                            placeholder="Select type"
                            value={formData.discountType}
                            onChange={(e) =>
                              updateFormData(
                                "discountType",
                                e.target.value,
                              )
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percent">
                            Percentage
                          </SelectItem>
                          <SelectItem value="fixed">
                            Fixed Amount
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="max-discount">
                      Max Discount %
                    </Label>
                    <div className="relative">
                      <Input
                        id="max-discount"
                        type="number"
                        placeholder="0"
                        value={formData.maxDiscount}
                        onChange={(e) =>
                          updateFormData(
                            "maxDiscount",
                            e.target.value,
                          )
                        }
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cust-discount">
                      Customer Discount %
                    </Label>
                    <div className="relative">
                      <Input
                        id="cust-discount"
                        type="number"
                        placeholder="0"
                        value={formData.customerDiscount}
                        onChange={(e) =>
                          updateFormData(
                            "customerDiscount",
                            e.target.value,
                          )
                        }
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="default-discount">
                      Default Discount %
                    </Label>
                    <div className="relative">
                      <Input
                        id="default-discount"
                        type="number"
                        placeholder="0"
                        value={formData.defaultDiscount}
                        onChange={(e) =>
                          updateFormData(
                            "defaultDiscount",
                            e.target.value,
                          )
                        }
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Variants Tab */}
          <TabsContent value="variants" className="space-y-6">
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Product Attributes</CardTitle>
                <CardDescription>
                  Define attributes for product variants
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="attributes">
                    Select Attributes
                  </Label>
                  <Select>
                    <SelectTrigger id="attributes">
                      <SelectValue placeholder="Choose attributes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="color">
                        Color
                      </SelectItem>
                      <SelectItem value="size">Size</SelectItem>
                      <SelectItem value="material">
                        Material
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Settings className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-900">
                        Configure Attributes
                      </h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Select product attributes and their
                        values to generate variants
                        automatically
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Generated Variants</CardTitle>
                    <CardDescription>
                      Manage product variants
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">
                    {variants.length} variants
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {variants.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm font-medium text-gray-900">
                      No variants yet
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Configure attributes to generate variants
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {variants.map((variant, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                      >
                        <div>
                          <p className="font-medium">
                            {variant.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {variant.sku}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}