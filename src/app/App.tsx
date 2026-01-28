import React, { useMemo, useState } from "react";

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
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { Checkbox } from "@/app/components/ui/checkbox";

type ProductType = "inventory" | "service" | "compo";
type TrackInventoryType = "quantity" | "lot" | "serial";
type DemandLevelType = "all" | "branch";

type DemandLevelRow = {
  level: number;
  from: string;
  to: string;
  notify: boolean;
};

type AttributeRow = {
  id: number;
  attribute: string;
  value: string;
};

type CompoItem = {
  id: number;
  product: string;
  unit: string;
  quantity: string;
  cost: string;
};

type PhotoRow = {
  id: number;
  file?: File;
  previewUrl?: string;
  description: string;
};

const App = () => {
  const [attachments, setAttachments] = useState<File[]>([]);
  const [barcodes, setBarcodes] = useState<string[]>([""]);
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
    // General info
    productType: "inventory" as ProductType,
    trackInventory: "quantity" as TrackInventoryType,
    totalQuantity: "",
    salesTax: "",
    purchaseTax: "",
    costCenter: "",
    salesEnabled: true,
    purchaseEnabled: true,
    gs1Barcode: "",
    notes: "",
    // Discounts
    basedOnSellingPrice: false, // Price based discounts
    discountType: "",
    maxDiscount: "",
    customerDiscount: "", // conditional discount
    defaultDiscount: "",
    // Additional info
    demandLevelType: "all" as DemandLevelType,
    branchId: "",
  });

  const [attributeRows, setAttributeRows] = useState<AttributeRow[]>([]);
  const [demandLevelsAll, setDemandLevelsAll] = useState<DemandLevelRow[]>([]);
  const [branchDemandLevels, setBranchDemandLevels] = useState<
    Record<string, DemandLevelRow[]>
  >({});
  const [expiryLevels, setExpiryLevels] = useState<DemandLevelRow[]>([]);
  const [compoItems, setCompoItems] = useState<CompoItem[]>([]);
  const [photoRows, setPhotoRows] = useState<PhotoRow[]>([]);

  const levelColors: Record<number, string> = {
    1: "bg-green-100 text-green-800",
    2: "bg-blue-100 text-blue-800",
    3: "bg-yellow-100 text-yellow-800",
    4: "bg-orange-100 text-orange-800",
    5: "bg-red-100 text-red-800",
  };

  const branches = [
    { id: "branch-1", name: "Main Branch" },
    { id: "branch-2", name: "Branch 2" },
    { id: "branch-3", name: "Branch 3" },
  ];

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatFileSize = (bytes: number) => {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const idx = Math.min(
      units.length - 1,
      Math.floor(Math.log(bytes) / Math.log(1024)),
    );
    const value = bytes / Math.pow(1024, idx);
    const digits = idx === 0 ? 0 : value < 10 ? 1 : 0;
    return `${value.toFixed(digits)} ${units[idx]}`;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
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

  const filledBarcodesCount = barcodes.filter(
    (b) => b.trim().length > 0,
  ).length;

  const getDemandRows = (): [
    DemandLevelRow[],
    (rows: DemandLevelRow[]) => void,
  ] => {
    if (formData.demandLevelType === "branch" && formData.branchId) {
      const current = branchDemandLevels[formData.branchId] ?? [];
      const setter = (rows: DemandLevelRow[]) => {
        setBranchDemandLevels((prev) => ({
          ...prev,
          [formData.branchId]: rows,
        }));
      };
      return [current, setter];
    }
    return [demandLevelsAll, setDemandLevelsAll];
  };

  const addDemandRow = () => {
    const [rows, setRows] = getDemandRows();
    if (rows.length >= 5) return;
    const nextLevel = rows.length + 1;
    setRows([...rows, { level: nextLevel, from: "", to: "", notify: false }]);
  };

  const updateDemandRow = (
    index: number,
    field: keyof DemandLevelRow,
    value: string | boolean,
  ) => {
    const [rows, setRows] = getDemandRows();
    const next = [...rows];
    (next[index] as any)[field] = value;
    setRows(next);
  };

  const removeDemandRow = (index: number) => {
    const [rows, setRows] = getDemandRows();
    const trimmed = rows.filter((_, i) => i !== index);
    const reLeveled = trimmed.map((row, i) => ({
      ...row,
      level: i + 1,
    }));
    setRows(reLeveled);
  };

  const addExpiryRow = () => {
    if (expiryLevels.length >= 5) return;
    const nextLevel = expiryLevels.length + 1;
    setExpiryLevels([
      ...expiryLevels,
      { level: nextLevel, from: "", to: "", notify: false },
    ]);
  };

  const updateExpiryRow = (
    index: number,
    field: keyof DemandLevelRow,
    value: string | boolean,
  ) => {
    const next = [...expiryLevels];
    (next[index] as any)[field] = value;
    setExpiryLevels(next);
  };

  const removeExpiryRow = (index: number) => {
    const trimmed = expiryLevels.filter((_, i) => i !== index);
    const reLeveled = trimmed.map((row, i) => ({
      ...row,
      level: i + 1,
    }));
    setExpiryLevels(reLeveled);
  };

  const addAttributeRow = () => {
    setAttributeRows((prev) => [
      ...prev,
      {
        id: prev.length ? prev[prev.length - 1].id + 1 : 1,
        attribute: "",
        value: "",
      },
    ]);
  };

  const updateAttributeRow = (
    id: number,
    field: keyof Omit<AttributeRow, "id">,
    value: string,
  ) => {
    setAttributeRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const removeAttributeRow = (id: number) => {
    setAttributeRows((prev) => prev.filter((row) => row.id !== id));
  };

  const addCompoItem = () => {
    setCompoItems((prev) => [
      ...prev,
      {
        id: prev.length ? prev[prev.length - 1].id + 1 : 1,
        product: "",
        unit: "",
        quantity: "",
        cost: "",
      },
    ]);
  };

  const updateCompoItem = (
    id: number,
    field: keyof Omit<CompoItem, "id">,
    value: string,
  ) => {
    setCompoItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const removeCompoItem = (id: number) => {
    setCompoItems((prev) => prev.filter((item) => item.id !== id));
  };

  const totalCompoCost = useMemo(() => {
    return compoItems.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const cost = parseFloat(item.cost) || 0;
      return sum + qty * cost;
    }, 0);
  }, [compoItems]);

  const addPhotoRow = () => {
    setPhotoRows((prev) => [
      ...prev,
      {
        id: prev.length ? prev[prev.length - 1].id + 1 : 1,
        description: "",
      },
    ]);
  };

  const handlePhotoFileChange = (
    id: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setPhotoRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, file, previewUrl } : row)),
    );
  };

  const updatePhotoDescription = (id: number, value: string) => {
    setPhotoRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, description: value } : row)),
    );
  };

  const removePhotoRow = (id: number) => {
    setPhotoRows((prev) => prev.filter((row) => row.id !== id));
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
      {/* Header */}
      <header className='bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm'>
        <div className='px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center'>
                  <Package className='w-5 h-5 text-white' />
                </div>
                <div>
                  <h1 className='text-2xl font-semibold text-gray-900'>
                    Create New Product
                  </h1>
                  <div className='flex flex-wrap items-center gap-2 mt-1'>
                    <p className='text-sm text-gray-500'>
                      Add a new product to your inventory
                    </p>
                    <Badge variant='secondary'>Draft</Badge>
                    {attachments.length > 0 && (
                      <Badge variant='outline'>
                        {attachments.length} attachment
                        {attachments.length === 1 ? "" : "s"}
                      </Badge>
                    )}
                    {filledBarcodesCount > 0 && (
                      <Badge variant='outline'>
                        {filledBarcodesCount} barcode
                        {filledBarcodesCount === 1 ? "" : "s"}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className='flex gap-3'>
              <Button
                variant='outline'
                size='lg'
                className='gap-2'
                type='button'
              >
                <X className='w-4 h-4' />
                Cancel
              </Button>
              <Button
                size='lg'
                className='bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 gap-2'
                type='button'
              >
                <Save className='w-4 h-4' />
                Save Product
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-6 py-8'>
        <Card className='shadow-sm hover:shadow-md transition-shadow mb-5'>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Name</Label>
                <Input
                  id='name'
                  placeholder='Enter name'
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='nameSecondLanguage'>Name Second Language</Label>
                <Input
                  id='nameSecondLanguage'
                  placeholder='Enter name second language'
                  value={formData.nameSecondLanguage}
                  onChange={(e) =>
                    updateFormData("nameSecondLanguage", e.target.value)
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='code'>Code</Label>
                <Input
                  id='code'
                  placeholder='e.g. 001'
                  value={formData.code}
                  onChange={(e) => updateFormData("code", e.target.value)}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='node-type'>Node Type</Label>
                <Select
                  value={formData.noteType}
                  onValueChange={(value) => updateFormData("nodeType", value)}
                >
                  <SelectTrigger id='node-type'>
                    <SelectValue placeholder='Select type' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='domain'>Domain</SelectItem>
                    <SelectItem value='category'>Category</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='space-y-6'
        >
          {/* Shopify-like vertical tabs layout */}
          <div className='bg-gray-50 border border-gray-200 rounded-xl overflow-hidden '>
            <div className='grid grid-cols-1 md:grid-cols-[360px_1fr]'>
              <TabsList className='flex flex-col h-auto w-full rounded-none bg-gray-50 p-0 border-r border-gray-200'>
                <TabsTrigger
                  value='basic'
                  className="relative w-full justify-start gap-3 rounded-none px-5 py-4 text-sm font-medium text-gray-700 border-b border-gray-200 hover:bg-gray-100 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-none data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:right-0 data-[state=active]:after:top-1/2 data-[state=active]:after:-translate-y-1/2 data-[state=active]:after:translate-x-full data-[state=active]:after:border-y-[14px] data-[state=active]:after:border-y-transparent data-[state=active]:after:border-l-[14px] data-[state=active]:after:border-l-white"
                >
                  <Package className='w-4 h-4' />
                  General Information
                </TabsTrigger>
                <TabsTrigger
                  value='codes'
                  className="relative w-full justify-start gap-3 rounded-none px-5 py-4 text-sm font-medium text-gray-700 border-b border-gray-200 hover:bg-gray-100 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-none data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:right-0 data-[state=active]:after:top-1/2 data-[state=active]:after:-translate-y-1/2 data-[state=active]:after:translate-x-full data-[state=active]:after:border-y-[14px] data-[state=active]:after:border-y-transparent data-[state=active]:after:border-l-[14px] data-[state=active]:after:border-l-white"
                >
                  <Barcode className='w-4 h-4' />
                  Discount
                </TabsTrigger>
                <TabsTrigger
                  value='details'
                  className="relative w-full justify-start gap-3 rounded-none px-5 py-4 text-sm font-medium text-gray-700 border-b border-gray-200 hover:bg-gray-100 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-none data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:right-0 data-[state=active]:after:top-1/2 data-[state=active]:after:-translate-y-1/2 data-[state=active]:after:translate-x-full data-[state=active]:after:border-y-[14px] data-[state=active]:after:border-y-transparent data-[state=active]:after:border-l-[14px] data-[state=active]:after:border-l-white"
                >
                  <FileText className='w-4 h-4' />
                  Attributes & Variants
                </TabsTrigger>
                <TabsTrigger
                  value='pricing'
                  className="relative w-full justify-start gap-3 rounded-none px-5 py-4 text-sm font-medium text-gray-700 border-b border-gray-200 hover:bg-gray-100 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-none data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:right-0 data-[state=active]:after:top-1/2 data-[state=active]:after:-translate-y-1/2 data-[state=active]:after:translate-x-full data-[state=active]:after:border-y-[14px] data-[state=active]:after:border-y-transparent data-[state=active]:after:border-l-[14px] data-[state=active]:after:border-l-white"
                >
                  <DollarSign className='w-4 h-4' />
                  Additional Information
                </TabsTrigger>
                <TabsTrigger
                  value='variants'
                  className="relative w-full justify-start gap-3 rounded-none px-5 py-4 text-sm font-medium text-gray-700 border-b border-gray-200 hover:bg-gray-100 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-none data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:right-0 data-[state=active]:after:top-1/2 data-[state=active]:after:-translate-y-1/2 data-[state=active]:after:translate-x-full data-[state=active]:after:border-y-[14px] data-[state=active]:after:border-y-transparent data-[state=active]:after:border-l-[14px] data-[state=active]:after:border-l-white"
                >
                  <Settings className='w-4 h-4' />
                  Compo
                </TabsTrigger>
                <TabsTrigger
                  value='photosDescription'
                  className="relative w-full justify-start gap-3 rounded-none px-5 py-4 text-sm font-medium text-gray-700 border-b border-gray-200 hover:bg-gray-100 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-none data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:right-0 data-[state=active]:after:top-1/2 data-[state=active]:after:-translate-y-1/2 data-[state=active]:after:translate-x-full data-[state=active]:after:border-y-[14px] data-[state=active]:after:border-y-transparent data-[state=active]:after:border-l-[14px] data-[state=active]:after:border-l-white"
                >
                  <Settings className='w-4 h-4' />
                  Photos & Description
                </TabsTrigger>
              </TabsList>

              <div className='bg-white px-6 py-5 min-h-[360px]'>
                {/* General Info Tab */}
                <TabsContent value='basic' className='space-y-6'>
                  <Card className='shadow-sm hover:shadow-md transition-shadow'>
                    <CardHeader>
                      <CardTitle>General Information</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-6'>
                      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                        <div className='space-y-4'>
                          <div className='space-y-2'>
                            <Label>Product Type</Label>
                            <RadioGroup
                              className='flex flex-wrap gap-4'
                              value={formData.productType}
                              onValueChange={(value) =>
                                updateFormData(
                                  "productType",
                                  value as ProductType,
                                )
                              }
                            >
                              <div className='flex items-center space-x-2'>
                                <RadioGroupItem
                                  value='inventory'
                                  id='type-inventory'
                                />
                                <Label
                                  htmlFor='type-inventory'
                                  className='font-normal'
                                >
                                  Inventory
                                </Label>
                              </div>
                              <div className='flex items-center space-x-2'>
                                <RadioGroupItem
                                  value='service'
                                  id='type-service'
                                />
                                <Label
                                  htmlFor='type-service'
                                  className='font-normal'
                                >
                                  Service
                                </Label>
                              </div>
                              <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='compo' id='type-compo' />
                                <Label
                                  htmlFor='type-compo'
                                  className='font-normal'
                                >
                                  Compo
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>

                          <div className='space-y-2'>
                            <Label>Track Inventory</Label>
                            <RadioGroup
                              className='flex flex-wrap gap-4'
                              value={formData.trackInventory}
                              onValueChange={(value) =>
                                updateFormData(
                                  "trackInventory",
                                  value as TrackInventoryType,
                                )
                              }
                            >
                              <div className='flex items-center space-x-2'>
                                <RadioGroupItem
                                  value='quantity'
                                  id='track-quantity'
                                />
                                <Label
                                  htmlFor='track-quantity'
                                  className='font-normal'
                                >
                                  By Quantity
                                </Label>
                              </div>
                              <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='lot' id='track-lot' />
                                <Label
                                  htmlFor='track-lot'
                                  className='font-normal'
                                >
                                  By Lot
                                </Label>
                              </div>
                              <div className='flex items-center space-x-2'>
                                <RadioGroupItem
                                  value='serial'
                                  id='track-serial'
                                />
                                <Label
                                  htmlFor='track-serial'
                                  className='font-normal'
                                >
                                  By Serial Number
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>

                          <div className='space-y-2'>
                            <Label htmlFor='total-quantity'>
                              Product Total Quantity
                            </Label>
                            <Input
                              id='total-quantity'
                              type='number'
                              value={formData.totalQuantity}
                              onChange={(e) =>
                                updateFormData("totalQuantity", e.target.value)
                              }
                            />
                          </div>
                        </div>

                        <div className='space-y-4'>
                          <div className='grid grid-cols-1 gap-4'>
                            <div className='space-y-2'>
                              <Label htmlFor='sales-tax'>Sales Taxes</Label>
                              <Select
                                value={formData.salesTax}
                                onValueChange={(value) =>
                                  updateFormData("salesTax", value)
                                }
                              >
                                <SelectTrigger id='sales-tax'>
                                  <SelectValue placeholder='Select sales tax' />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value='none'>No Tax</SelectItem>
                                  <SelectItem value='vat-5'>VAT 5%</SelectItem>
                                  <SelectItem value='vat-15'>
                                    VAT 15%
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className='space-y-2'>
                              <Label htmlFor='purchase-tax'>
                                Purchase Taxes
                              </Label>
                              <Select
                                value={formData.purchaseTax}
                                onValueChange={(value) =>
                                  updateFormData("purchaseTax", value)
                                }
                              >
                                <SelectTrigger id='purchase-tax'>
                                  <SelectValue placeholder='Select purchase tax' />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value='none'>No Tax</SelectItem>
                                  <SelectItem value='vat-5'>VAT 5%</SelectItem>
                                  <SelectItem value='vat-15'>
                                    VAT 15%
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className='space-y-2'>
                              <Label htmlFor='cost-center'>Cost Centers</Label>
                              <Select
                                value={formData.costCenter}
                                onValueChange={(value) =>
                                  updateFormData("costCenter", value)
                                }
                              >
                                <SelectTrigger id='cost-center'>
                                  <SelectValue placeholder='Select cost center' />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value='main'>
                                    Main Cost Center
                                  </SelectItem>
                                  <SelectItem value='online'>
                                    Online Store
                                  </SelectItem>
                                  <SelectItem value='wholesale'>
                                    Wholesale
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className='grid grid-cols-2 gap-4'>
                            <div className='flex items-center justify-between rounded-md border border-gray-200 px-3 py-2'>
                              <div>
                                <Label className='text-sm'>Sales</Label>
                              </div>
                              <Switch
                                checked={formData.salesEnabled}
                                onCheckedChange={(checked) =>
                                  updateFormData("salesEnabled", checked)
                                }
                              />
                            </div>
                            <div className='flex items-center justify-between rounded-md border border-gray-200 px-3 py-2'>
                              <div>
                                <Label className='text-sm'>Purchase</Label>
                              </div>
                              <Switch
                                checked={formData.purchaseEnabled}
                                onCheckedChange={(checked) =>
                                  updateFormData("purchaseEnabled", checked)
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                        <div className='space-y-4'>
                          <div className='flex items-center justify-between'>
                            <div>
                              <Label>Barcodes</Label>
                              <p className='text-xs text-gray-500'>
                                You can add multiple barcodes.
                              </p>
                            </div>
                            <Button
                              type='button'
                              size='sm'
                              variant='outline'
                              onClick={addBarcode}
                            >
                              <Plus className='w-4 h-4 mr-1' />
                              Add
                            </Button>
                          </div>
                          <div className='space-y-2'>
                            {barcodes.map((barcode, index) => (
                              <div
                                key={index}
                                className='flex items-center gap-2'
                              >
                                <Input
                                  value={barcode}
                                  onChange={(e) =>
                                    updateBarcode(index, e.target.value)
                                  }
                                  placeholder={`Barcode #${index + 1}`}
                                />
                                {barcodes.length > 1 && (
                                  <Button
                                    type='button'
                                    variant='ghost'
                                    size='icon'
                                    onClick={() => removeBarcode(index)}
                                  >
                                    <Trash2 className='w-4 h-4 text-red-500' />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className='space-y-4'>
                          <div className='space-y-2'>
                            <Label htmlFor='gs1-barcode'>GS1 Barcode</Label>
                            <Input
                              id='gs1-barcode'
                              value={formData.gs1Barcode}
                              onChange={(e) =>
                                updateFormData("gs1Barcode", e.target.value)
                              }
                              placeholder='Enter GS1 barcode'
                            />
                          </div>
                          <div className='space-y-2'>
                            <Label htmlFor='notes'>Notes</Label>
                            <Textarea
                              id='notes'
                              value={formData.notes}
                              onChange={(e) =>
                                updateFormData("notes", e.target.value)
                              }
                              rows={4}
                              placeholder='Write notes about the product...'
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Discount Tab */}
                <TabsContent value='codes' className='space-y-6'>
                  <Card className='shadow-sm hover:shadow-md transition-shadow'>
                    <CardHeader>
                      <CardTitle>Discount</CardTitle>
                      <CardDescription>
                        Discount settings for this product.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-6'>
                      <div className='flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4'>
                        <div className='space-y-0.5'>
                          <Label>Price Based Discounts</Label>
                          <p className='text-sm text-gray-500'>
                            Price Based Discounts
                          </p>
                        </div>
                        <Switch
                          checked={formData.basedOnSellingPrice}
                          onCheckedChange={(checked) =>
                            updateFormData("basedOnSellingPrice", checked)
                          }
                        />
                      </div>

                      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                        <div className='space-y-2'>
                          <Label htmlFor='max-discount'>Maximum Discount</Label>
                          <Input
                            id='max-discount'
                            type='number'
                            step='0.01'
                            value={formData.maxDiscount}
                            onChange={(e) =>
                              updateFormData("maxDiscount", e.target.value)
                            }
                            placeholder='0.00'
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label htmlFor='conditional-discount'>
                            Conditional Discount
                          </Label>
                          <Input
                            id='conditional-discount'
                            type='number'
                            step='0.01'
                            value={formData.customerDiscount}
                            onChange={(e) =>
                              updateFormData("customerDiscount", e.target.value)
                            }
                            placeholder='0.00'
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label htmlFor='default-discount'>
                            Default Discount
                          </Label>
                          <Input
                            id='default-discount'
                            type='number'
                            step='0.01'
                            value={formData.defaultDiscount}
                            onChange={(e) =>
                              updateFormData("defaultDiscount", e.target.value)
                            }
                            placeholder='0.00'
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Attributes & Variants Tab */}
                <TabsContent value='details' className='space-y-6'>
                  <Card className='shadow-sm hover:shadow-md transition-shadow'>
                    <CardHeader>
                      <div className='flex items-center justify-between gap-4'>
                        <div>
                          <CardTitle>Attributes & Variants</CardTitle>
                          <CardDescription>
                            Attributes and values table.
                          </CardDescription>
                        </div>
                        {formData.productType !== "compo" && (
                          <Button
                            type='button'
                            size='sm'
                            variant='outline'
                            onClick={addAttributeRow}
                          >
                            <Plus className='w-4 h-4 mr-1' />
                            Add Row
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      {formData.productType === "compo" ? (
                        <div className='rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700'>
                          This table is hidden when the product type is{" "}
                          <b>Compo</b>.
                        </div>
                      ) : attributeRows.length === 0 ? (
                        <div className='rounded-lg border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500'>
                          No attributes yet. Click <b>Add Row</b>.
                        </div>
                      ) : (
                        <div className='overflow-x-auto rounded-lg border border-gray-200'>
                          <div className='min-w-[720px]'>
                            <div className='grid grid-cols-[1fr_1fr_80px] bg-gray-50 border-b border-gray-200'>
                              <div className='px-4 py-3 text-sm font-medium text-gray-700'>
                                Attribute
                              </div>
                              <div className='px-4 py-3 text-sm font-medium text-gray-700'>
                                Value
                              </div>
                              <div className='px-4 py-3 text-sm font-medium text-gray-700 text-center'>
                                Actions
                              </div>
                            </div>
                            {attributeRows.map((row) => (
                              <div
                                key={row.id}
                                className='grid grid-cols-[1fr_1fr_80px] border-b border-gray-100 last:border-b-0'
                              >
                                <div className='px-4 py-3'>
                                  <Select
                                    value={row.attribute}
                                    onValueChange={(value) =>
                                      updateAttributeRow(
                                        row.id,
                                        "attribute",
                                        value,
                                      )
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder='Select attribute' />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value='color'>
                                        Color
                                      </SelectItem>
                                      <SelectItem value='size'>Size</SelectItem>
                                      <SelectItem value='material'>
                                        Material
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className='px-4 py-3'>
                                  <Select
                                    value={row.value}
                                    onValueChange={(value) =>
                                      updateAttributeRow(row.id, "value", value)
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder='Select value' />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value='v1'>
                                        Value 1
                                      </SelectItem>
                                      <SelectItem value='v2'>
                                        Value 2
                                      </SelectItem>
                                      <SelectItem value='v3'>
                                        Value 3
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className='px-4 py-3 flex items-center justify-center'>
                                  <Button
                                    type='button'
                                    variant='ghost'
                                    size='icon'
                                    onClick={() => removeAttributeRow(row.id)}
                                  >
                                    <Trash2 className='w-4 h-4 text-red-500' />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Additional Info Tab */}
                <TabsContent value='pricing' className='space-y-6'>
                  <Card className='shadow-sm hover:shadow-md transition-shadow'>
                    <CardHeader>
                      <CardTitle>Additional Information</CardTitle>
                      <CardDescription>
                        Optional info and demand levels.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-6'>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div className='space-y-2'>
                          <Label htmlFor='model'>Model</Label>
                          <Input
                            id='model'
                            value={formData.model}
                            onChange={(e) =>
                              updateFormData("model", e.target.value)
                            }
                            placeholder='Optional'
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label htmlFor='version'>Version</Label>
                          <Input
                            id='version'
                            value={formData.version}
                            onChange={(e) =>
                              updateFormData("version", e.target.value)
                            }
                            placeholder='Optional'
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label htmlFor='country'>Country of Origin</Label>
                          <Select
                            value={formData.country}
                            onValueChange={(value) =>
                              updateFormData("country", value)
                            }
                          >
                            <SelectTrigger id='country'>
                              <SelectValue placeholder='Select country' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='eg'>Egypt</SelectItem>
                              <SelectItem value='sa'>Saudi Arabia</SelectItem>
                              <SelectItem value='us'>United States</SelectItem>
                              <SelectItem value='cn'>China</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className='space-y-2'>
                          <Label htmlFor='manufacturer'>
                            Manufacturer Companies
                          </Label>
                          <Select
                            value={formData.manufacturer}
                            onValueChange={(value) =>
                              updateFormData("manufacturer", value)
                            }
                          >
                            <SelectTrigger id='manufacturer'>
                              <SelectValue placeholder='Select manufacturer' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='mfg1'>
                                Manufacturer 1
                              </SelectItem>
                              <SelectItem value='mfg2'>
                                Manufacturer 2
                              </SelectItem>
                              <SelectItem value='mfg3'>
                                Manufacturer 3
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Separator />

                      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                        <div className='space-y-2'>
                          <Label htmlFor='demand-level-type'>
                            Demand Level Type
                          </Label>
                          <Select
                            value={formData.demandLevelType}
                            onValueChange={(value) =>
                              updateFormData(
                                "demandLevelType",
                                value as DemandLevelType,
                              )
                            }
                          >
                            <SelectTrigger id='demand-level-type'>
                              <SelectValue placeholder='Select type' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='all'>All</SelectItem>
                              <SelectItem value='branch'>
                                Branch Level
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {formData.demandLevelType === "branch" && (
                          <div className='space-y-2'>
                            <Label htmlFor='branch'>Branches</Label>
                            <Select
                              value={formData.branchId}
                              onValueChange={(value) =>
                                updateFormData("branchId", value)
                              }
                            >
                              <SelectTrigger id='branch'>
                                <SelectValue placeholder='Select branch' />
                              </SelectTrigger>
                              <SelectContent>
                                {branches.map((b) => (
                                  <SelectItem key={b.id} value={b.id}>
                                    {b.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>

                      <Card className='shadow-none border border-gray-200'>
                        <CardHeader className='pb-3'>
                          <div className='flex items-center justify-between gap-4'>
                            <div>
                              <CardTitle className='text-base'>
                                Demand Levels & Saturation Limit
                              </CardTitle>
                              <CardDescription>
                                Add up to 5 levels.
                              </CardDescription>
                            </div>
                            <Button
                              type='button'
                              size='sm'
                              variant='outline'
                              onClick={addDemandRow}
                              disabled={
                                (formData.demandLevelType === "branch" &&
                                  !formData.branchId) ||
                                (formData.demandLevelType === "branch"
                                  ? (
                                      branchDemandLevels[formData.branchId] ??
                                      []
                                    ).length >= 5
                                  : demandLevelsAll.length >= 5)
                              }
                            >
                              <Plus className='w-4 h-4 mr-1' />
                              Add Row
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className='pt-0'>
                          {formData.demandLevelType === "branch" &&
                          !formData.branchId ? (
                            <div className='rounded-lg border border-dashed border-gray-200 p-6 text-sm text-gray-500'>
                              Select a branch first to view its demand levels.
                            </div>
                          ) : (
                            <div className='overflow-x-auto rounded-lg border border-gray-200'>
                              <div className='min-w-[780px]'>
                                <div className='grid grid-cols-[160px_1fr_1fr_140px_80px] bg-gray-50 border-b border-gray-200'>
                                  <div className='px-4 py-3 text-sm font-medium text-gray-700'>
                                    Level
                                  </div>
                                  <div className='px-4 py-3 text-sm font-medium text-gray-700'>
                                    Quantity From
                                  </div>
                                  <div className='px-4 py-3 text-sm font-medium text-gray-700'>
                                    Quantity To
                                  </div>
                                  <div className='px-4 py-3 text-sm font-medium text-gray-700'>
                                    Notifications
                                  </div>
                                  <div className='px-4 py-3 text-sm font-medium text-gray-700 text-center'>
                                    Actions
                                  </div>
                                </div>
                                {getDemandRows()[0].map((row, index) => (
                                  <div
                                    key={row.level}
                                    className='grid grid-cols-[160px_1fr_1fr_140px_80px] border-b border-gray-100 last:border-b-0'
                                  >
                                    <div className='px-4 py-3 flex items-center'>
                                      <span
                                        className={`inline-flex items-center justify-center w-10 h-8 rounded-md text-sm font-semibold ${levelColors[row.level]}`}
                                      >
                                        {row.level}
                                      </span>
                                    </div>
                                    <div className='px-4 py-3'>
                                      <Input
                                        type='number'
                                        step='0.01'
                                        value={row.from}
                                        onChange={(e) =>
                                          updateDemandRow(
                                            index,
                                            "from",
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </div>
                                    <div className='px-4 py-3'>
                                      <Input
                                        type='number'
                                        step='0.01'
                                        value={row.to}
                                        onChange={(e) =>
                                          updateDemandRow(
                                            index,
                                            "to",
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </div>
                                    <div className='px-4 py-3 flex items-center'>
                                      <div className='flex items-center gap-2'>
                                        <Checkbox
                                          checked={row.notify}
                                          onCheckedChange={(checked) =>
                                            updateDemandRow(
                                              index,
                                              "notify",
                                              Boolean(checked),
                                            )
                                          }
                                        />
                                        <span className='text-sm text-gray-600'>
                                          Enable
                                        </span>
                                      </div>
                                    </div>
                                    <div className='px-4 py-3 flex items-center justify-center'>
                                      <Button
                                        type='button'
                                        variant='ghost'
                                        size='icon'
                                        onClick={() => removeDemandRow(index)}
                                      >
                                        <Trash2 className='w-4 h-4 text-red-500' />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                                {getDemandRows()[0].length === 0 && (
                                  <div className='p-6 text-sm text-gray-500'>
                                    No rows yet. Click Add Row.
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card className='shadow-none border border-gray-200'>
                        <CardHeader className='pb-3'>
                          <div className='flex items-center justify-between gap-4'>
                            <div>
                              <CardTitle className='text-base'>
                                Expiry Levels
                              </CardTitle>
                              <CardDescription>
                                Add up to 5 levels.
                              </CardDescription>
                            </div>
                            <Button
                              type='button'
                              size='sm'
                              variant='outline'
                              onClick={addExpiryRow}
                              disabled={expiryLevels.length >= 5}
                            >
                              <Plus className='w-4 h-4 mr-1' />
                              Add Row
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className='pt-0'>
                          <div className='overflow-x-auto rounded-lg border border-gray-200'>
                            <div className='min-w-[780px]'>
                              <div className='grid grid-cols-[160px_1fr_1fr_140px_80px] bg-gray-50 border-b border-gray-200'>
                                <div className='px-4 py-3 text-sm font-medium text-gray-700'>
                                  Level
                                </div>
                                <div className='px-4 py-3 text-sm font-medium text-gray-700'>
                                  Days From
                                </div>
                                <div className='px-4 py-3 text-sm font-medium text-gray-700'>
                                  Days To
                                </div>
                                <div className='px-4 py-3 text-sm font-medium text-gray-700'>
                                  Notifications
                                </div>
                                <div className='px-4 py-3 text-sm font-medium text-gray-700 text-center'>
                                  Actions
                                </div>
                              </div>
                              {expiryLevels.map((row, index) => (
                                <div
                                  key={row.level}
                                  className='grid grid-cols-[160px_1fr_1fr_140px_80px] border-b border-gray-100 last:border-b-0'
                                >
                                  <div className='px-4 py-3 flex items-center'>
                                    <span
                                      className={`inline-flex items-center justify-center w-10 h-8 rounded-md text-sm font-semibold ${levelColors[row.level]}`}
                                    >
                                      {row.level}
                                    </span>
                                  </div>
                                  <div className='px-4 py-3'>
                                    <Input
                                      type='number'
                                      step='0.01'
                                      value={row.from}
                                      onChange={(e) =>
                                        updateExpiryRow(
                                          index,
                                          "from",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </div>
                                  <div className='px-4 py-3'>
                                    <Input
                                      type='number'
                                      step='0.01'
                                      value={row.to}
                                      onChange={(e) =>
                                        updateExpiryRow(
                                          index,
                                          "to",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </div>
                                  <div className='px-4 py-3 flex items-center'>
                                    <div className='flex items-center gap-2'>
                                      <Checkbox
                                        checked={row.notify}
                                        onCheckedChange={(checked) =>
                                          updateExpiryRow(
                                            index,
                                            "notify",
                                            Boolean(checked),
                                          )
                                        }
                                      />
                                      <span className='text-sm text-gray-600'>
                                        Enable
                                      </span>
                                    </div>
                                  </div>
                                  <div className='px-4 py-3 flex items-center justify-center'>
                                    <Button
                                      type='button'
                                      variant='ghost'
                                      size='icon'
                                      onClick={() => removeExpiryRow(index)}
                                    >
                                      <Trash2 className='w-4 h-4 text-red-500' />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                              {expiryLevels.length === 0 && (
                                <div className='p-6 text-sm text-gray-500'>
                                  No rows yet. Click Add Row.
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Compo Tab */}
                <TabsContent value='variants' className='space-y-6'>
                  <Card className='shadow-sm hover:shadow-md transition-shadow'>
                    <CardHeader>
                      <div className='flex items-center justify-between gap-4'>
                        <div>
                          <CardTitle>Compo</CardTitle>
                          <CardDescription>
                            Bill of Materials (BOM) table.
                          </CardDescription>
                        </div>
                        <Button
                          type='button'
                          size='sm'
                          variant='outline'
                          onClick={addCompoItem}
                        >
                          <Plus className='w-4 h-4 mr-1' />
                          Add Row
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <div className='overflow-x-auto rounded-lg border border-gray-200'>
                        <div className='min-w-[920px]'>
                          <div className='grid grid-cols-[1fr_180px_160px_160px_80px] bg-gray-50 border-b border-gray-200'>
                            <div className='px-4 py-3 text-sm font-medium text-gray-700'>
                              Product
                            </div>
                            <div className='px-4 py-3 text-sm font-medium text-gray-700'>
                              Unit
                            </div>
                            <div className='px-4 py-3 text-sm font-medium text-gray-700'>
                              Quantity
                            </div>
                            <div className='px-4 py-3 text-sm font-medium text-gray-700'>
                              Cost
                            </div>
                            <div className='px-4 py-3 text-sm font-medium text-gray-700 text-center'>
                              Actions
                            </div>
                          </div>
                          {compoItems.map((row) => (
                            <div
                              key={row.id}
                              className='grid grid-cols-[1fr_180px_160px_160px_80px] border-b border-gray-100 last:border-b-0'
                            >
                              <div className='px-4 py-3'>
                                <Select
                                  value={row.product}
                                  onValueChange={(value) =>
                                    updateCompoItem(row.id, "product", value)
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder='Select product' />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value='p1'>
                                      Product 1
                                    </SelectItem>
                                    <SelectItem value='p2'>
                                      Product 2
                                    </SelectItem>
                                    <SelectItem value='p3'>
                                      Product 3
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className='px-4 py-3'>
                                <Select
                                  value={row.unit}
                                  onValueChange={(value) =>
                                    updateCompoItem(row.id, "unit", value)
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder='Unit' />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value='pcs'>Pieces</SelectItem>
                                    <SelectItem value='kg'>
                                      Kilograms
                                    </SelectItem>
                                    <SelectItem value='box'>Box</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className='px-4 py-3'>
                                <Input
                                  type='number'
                                  step='0.01'
                                  value={row.quantity}
                                  onChange={(e) =>
                                    updateCompoItem(
                                      row.id,
                                      "quantity",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <div className='px-4 py-3'>
                                <Input
                                  type='number'
                                  step='0.01'
                                  value={row.cost}
                                  onChange={(e) =>
                                    updateCompoItem(
                                      row.id,
                                      "cost",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <div className='px-4 py-3 flex items-center justify-center'>
                                <Button
                                  type='button'
                                  variant='ghost'
                                  size='icon'
                                  onClick={() => removeCompoItem(row.id)}
                                >
                                  <Trash2 className='w-4 h-4 text-red-500' />
                                </Button>
                              </div>
                            </div>
                          ))}
                          {compoItems.length === 0 && (
                            <div className='p-6 text-sm text-gray-500'>
                              No rows yet. Click Add Row.
                            </div>
                          )}
                        </div>
                      </div>

                      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div className='space-y-2'>
                          <Label htmlFor='total-compo-cost'>Total Cost</Label>
                          <Input
                            id='total-compo-cost'
                            value={totalCompoCost.toFixed(2)}
                            readOnly
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Photos & Description Tab */}
                <TabsContent value='photosDescription' className='space-y-6'>
                  <Card className='shadow-sm hover:shadow-md transition-shadow'>
                    <CardHeader>
                      <div className='flex items-center justify-between gap-4'>
                        <div>
                          <CardTitle>Photos & Description</CardTitle>
                          <CardDescription>
                            Add multiple photos with an optional description per
                            row.
                          </CardDescription>
                        </div>
                        <Button
                          type='button'
                          size='sm'
                          variant='outline'
                          onClick={addPhotoRow}
                        >
                          <Plus className='w-4 h-4 mr-1' />
                          Add Row
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <div className='overflow-x-auto rounded-lg border border-gray-200'>
                        <div className='min-w-[920px]'>
                          <div className='grid grid-cols-[260px_1fr_80px] bg-gray-50 border-b border-gray-200'>
                            <div className='px-4 py-3 text-sm font-medium text-gray-700'>
                              Product Photo
                            </div>
                            <div className='px-4 py-3 text-sm font-medium text-gray-700'>
                              Product Description
                            </div>
                            <div className='px-4 py-3 text-sm font-medium text-gray-700 text-center'>
                              Actions
                            </div>
                          </div>

                          {photoRows.map((row) => (
                            <div
                              key={row.id}
                              className='grid grid-cols-[260px_1fr_80px] border-b border-gray-100 last:border-b-0'
                            >
                              <div className='px-4 py-3'>
                                <div className='space-y-2'>
                                  {row.previewUrl ? (
                                    <div className='relative w-full h-32 rounded-md overflow-hidden border border-gray-200 bg-gray-50'>
                                      {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
                                      <img
                                        src={row.previewUrl}
                                        alt='product'
                                        className='w-full h-full object-cover'
                                      />
                                    </div>
                                  ) : (
                                    <div className='w-full h-32 rounded-md border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center text-sm text-gray-500'>
                                      No image
                                    </div>
                                  )}
                                  <input
                                    type='file'
                                    accept='image/*'
                                    className='block w-full text-sm'
                                    onChange={(e) =>
                                      handlePhotoFileChange(row.id, e)
                                    }
                                  />
                                </div>
                              </div>
                              <div className='px-4 py-3'>
                                <Textarea
                                  value={row.description}
                                  onChange={(e) =>
                                    updatePhotoDescription(
                                      row.id,
                                      e.target.value,
                                    )
                                  }
                                  placeholder='Optional...'
                                  rows={4}
                                />
                              </div>
                              <div className='px-4 py-3 flex items-start justify-center'>
                                <Button
                                  type='button'
                                  variant='ghost'
                                  size='icon'
                                  onClick={() => removePhotoRow(row.id)}
                                >
                                  <Trash2 className='w-4 h-4 text-red-500' />
                                </Button>
                              </div>
                            </div>
                          ))}

                          {photoRows.length === 0 && (
                            <div className='p-6 text-sm text-gray-500'>
                              No rows yet. Click Add Row.
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </div>
          </div>
        </Tabs>
      </main>
    </div>
  );
};

export default App;
