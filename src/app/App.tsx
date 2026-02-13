import { Fragment, useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Checkbox } from "@/app/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Separator } from "@/app/components/ui/separator";
import { Switch } from "@/app/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import {
  Barcode,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  FileText,
  Info,
  Package,
  Plus,
  Save,
  Settings,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";

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
  values: string[];
  isApply: boolean;
};

type AttributeCombination = {
  id: number;
  attributes: Array<{ attribute: string; value: string }>;
  name: string;
  isApply: boolean;
};

type CompoItem = {
  id: number;
  product: string;
  unit: string;
  quantity: string;
  cost: string;
};

type PriceBasedDiscountRow = {
  id: number;
  name: string;
  discount: string;
  discountType: string;
};

type PhotoRow = {
  id: number;
  file?: File;
  previewUrl?: string;
  description: string;
};

type SalesPrice = {
  id: string;
  name: string;
  price: number;
};

const SalesPricesTable: React.FC<{
  prices: SalesPrice[];
  onChange?: (id: string, price: number) => void;
}> = ({ prices, onChange }) => {
  return (
    <div className='w-full space-y-2'>
      <p className='text-xs text-muted-foreground'>
        Sales Prices ({prices.length})
      </p>

      <table className='w-full text-sm border rounded-md'>
        <thead className='bg-gray-50'>
          <tr>
            {prices.map((price) => (
              <Fragment key={price.id}>
                <th className='px-3 py-2 text-left text-[11px] font-medium'>
                  {price.name}
                </th>
              </Fragment>
            ))}
          </tr>
        </thead>

        <tbody>
          <tr className='border-t'>
            {prices.map((price) => (
              <Fragment key={price.id}>
                <td className='px-3 py-2'>
                  <Input
                    type='number'
                    placeholder='0.00'
                    value={price.price}
                    onChange={(e) =>
                      onChange?.(price.id, Number(e.target.value))
                    }
                  />
                </td>
              </Fragment>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};
const App = () => {
  const [attachments, setAttachments] = useState<File[]>([]);
  const [barcodes, setBarcodes] = useState<string[]>([""]);
  const [costCenters, setCostCenters] = useState<string[]>([""]);
  const [units, setUnits] = useState<
    {
      id: number;
      name: string;
      factor: string;
      salePrice: string;
      packingUnits: string;
      partsCount: string;
      equals: string;
      isDefaultSales: boolean;
      isDefaultPurchases: boolean;
      lastCostPrice: string;
      avgCostPrice: string;
      showPrices: boolean;
      isExpanded: boolean;
      salesPrices: SalesPrice[];
    }[]
  >([
    {
      id: 1,
      name: "",
      factor: "1",
      salePrice: "",
      packingUnits: "",
      partsCount: "",
      equals: "",
      isDefaultSales: true,
      isDefaultPurchases: true,
      lastCostPrice: "",
      avgCostPrice: "",
      showPrices: false,
      isExpanded: false,
      salesPrices: [
        { id: "1", name: "Retail", price: 0 },
        { id: "2", name: "Wholesale", price: 0 },
      ],
    },
  ]);
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
    purchasePrice: "",
    salePrice: "",
    salesTax: "",
    purchaseTax: "",
    salesEnabled: true,
    purchaseEnabled: true,
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
  const [attributeCombinations, setAttributeCombinations] = useState<
    AttributeCombination[]
  >([]);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const [demandLevelsAll, setDemandLevelsAll] = useState<DemandLevelRow[]>([]);
  const [branchDemandLevels, setBranchDemandLevels] = useState<
    Record<string, DemandLevelRow[]>
  >({});
  const [expiryLevels, setExpiryLevels] = useState<DemandLevelRow[]>([]);
  const [compoItems, setCompoItems] = useState<CompoItem[]>([]);
  const [photoRows, setPhotoRows] = useState<PhotoRow[]>([]);
  const [priceDiscountRows, setPriceDiscountRows] = useState<
    PriceBasedDiscountRow[]
  >([]);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [dialogPreviewIndex, setDialogPreviewIndex] = useState<number | null>(
    null,
  );
  const [isDragging, setIsDragging] = useState(false);

  const makePhotoPrimary = (index: number) => {
    if (index === 0) return;
    setPhotoRows((prev) => {
      const newRows = [...prev];
      const [selectedPhoto] = newRows.splice(index, 1);
      newRows.unshift(selectedPhoto);
      return newRows;
    });
    setActivePreviewIndex(0);
  };

  const handlePhotoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const previewUrl = URL.createObjectURL(file);
      const newRow: PhotoRow = {
        id: photoRows.length ? Math.max(...photoRows.map((r) => r.id)) + 1 : 1,
        file,
        previewUrl,
        description: "",
      };
      setPhotoRows((prev) => [...prev, newRow]);
      if (photoRows.length === 0) {
        setActivePreviewIndex(0);
      }
    }
  };

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

  const addCostCenter = () => {
    setCostCenters([...costCenters, ""]);
  };

  const removeCostCenter = (index: number) => {
    setCostCenters(costCenters.filter((_, i) => i !== index));
  };

  const updateCostCenter = (index: number, value: string) => {
    const newCostCenters = [...costCenters];
    newCostCenters[index] = value;
    setCostCenters(newCostCenters);
  };

  const addUnit = () => {
    setUnits([
      ...units,
      {
        id: Date.now(),
        name: "",
        factor: "",
        salePrice: "",
        packingUnits: "",
        partsCount: "",
        equals: "",
        isDefaultSales: false,
        isDefaultPurchases: false,
        lastCostPrice: "",
        avgCostPrice: "",
        showPrices: false,
        isExpanded: true,
        salesPrices: [
          { id: "1", name: "Retail", price: 0 },
          { id: "2", name: "Wholesale", price: 0 },
        ],
      },
    ]);
  };

  const removeUnit = (id: number) => {
    if (units.length > 1) {
      setUnits(units.filter((u) => u.id !== id));
    }
  };

  const updateUnit = (id: number, field: string, value: any) => {
    setUnits((prevUnits) => {
      return prevUnits.map((u) => {
        if (field === "isDefaultSales" && value === true) {
          return {
            ...u,
            isDefaultSales: u.id === id,
            isDefaultPurchases: u.id === id ? false : u.isDefaultPurchases,
          };
        }
        if (field === "isDefaultPurchases" && value === true) {
          return {
            ...u,
            isDefaultPurchases: u.id === id,
            isDefaultSales: u.id === id ? false : u.isDefaultSales,
          };
        }
        if (u.id === id) {
          return { ...u, [field]: value };
        }
        return u;
      });
    });
  };

  const addPriceDiscountRow = () => {
    setPriceDiscountRows([
      ...priceDiscountRows,
      { id: Date.now(), name: "", discount: "", discountType: "percentage" },
    ]);
  };

  const removePriceDiscountRow = (id: number) => {
    setPriceDiscountRows(priceDiscountRows.filter((r) => r.id !== id));
  };

  const updatePriceDiscountRow = (id: number, field: string, value: string) => {
    setPriceDiscountRows(
      priceDiscountRows.map((r) =>
        r.id === id ? { ...r, [field]: value } : r,
      ),
    );
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
        values: [],
        isApply: true,
      },
    ]);
  };

  const updateAttributeRow = (
    id: number,
    field: keyof Omit<AttributeRow, "id">,
    value: string | string[],
  ) => {
    setAttributeRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const addAttributeValue = (id: number, value: string) => {
    setAttributeRows((prev) =>
      prev.map((row) =>
        row.id === id && !row.values.includes(value)
          ? { ...row, values: [...row.values, value] }
          : row,
      ),
    );
  };

  const removeAttributeValue = (id: number, valueToRemove: string) => {
    setAttributeRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? { ...row, values: row.values.filter((v) => v !== valueToRemove) }
          : row,
      ),
    );
  };

  const toggleAttributeValue = (
    e: React.MouseEvent,
    id: number,
    value: string,
  ) => {
    e.stopPropagation();
    setAttributeRows((prev) => {
      const row = prev.find((r) => r.id === id);
      if (!row) return prev;

      const newValues = row.values.includes(value)
        ? row.values.filter((v) => v !== value)
        : [...row.values, value];

      return prev.map((r) => (r.id === id ? { ...r, values: newValues } : r));
    });
  };

  const toggleAttributeRowApply = (id: number) => {
    setAttributeRows((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, isApply: !row.isApply } : row,
      ),
    );
  };

  const removeAttributeRow = (id: number) => {
    setAttributeRows((prev) => prev.filter((row) => row.id !== id));
  };

  const removeAttributeCompo = (id: number) => {
    setAttributeCombinations((prev) => prev.filter((row) => row.id !== id));
  };

  const toggleAttributeComboApply = (id: number) => {
    setAttributeCombinations((prev) =>
      prev.map((combo) =>
        combo.id === id ? { ...combo, isApply: !combo.isApply } : combo,
      ),
    );
  };

  const generateAttributeCombinations = () => {
    // Group attributes by their name and collect unique values
    const attributeGroups: Record<string, string[]> = {};

    attributeRows.forEach((row) => {
      if (row.attribute && row.values.length > 0) {
        attributeGroups[row.attribute] = row.values;
      }
    });

    // If no valid attributes, clear combinations
    if (Object.keys(attributeGroups).length === 0) {
      setAttributeCombinations([]);
      return;
    }

    // Generate all possible combinations
    const attributeNames = Object.keys(attributeGroups);
    const combinations: Array<Array<{ attribute: string; value: string }>> = [];

    // Recursive function to generate combinations
    const generateCombinations = (
      index: number,
      current: Array<{ attribute: string; value: string }>,
    ) => {
      if (index === attributeNames.length) {
        combinations.push([...current]);
        return;
      }

      const attributeName = attributeNames[index];
      const values = attributeGroups[attributeName];

      for (const value of values) {
        current.push({ attribute: attributeName, value });
        generateCombinations(index + 1, current);
        current.pop();
      }
    };

    generateCombinations(0, []);

    // Convert combinations to AttributeCombination format
    const newCombinations: AttributeCombination[] = combinations.map(
      (combo, index) => {
        const name = combo.map((item) => `${item.value}`).join(" / ");
        return {
          id: index,
          attributes: combo,
          name: name || "Variant",
          isApply: true,
        };
      },
    );

    setAttributeCombinations(newCombinations);
  };

  useEffect(() => {
    generateAttributeCombinations();
  }, [attributeRows]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        !target.closest(".multi-select-dropdown") &&
        !target.closest(".dropdown-portal")
      ) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const openDropdown = (rowId: number, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    console.log("Opening dropdown for row:", rowId, "rect:", rect);
    setDropdownPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
    setOpenDropdownId(rowId);
  };

  const dropdownRefs = useRef<{ [key: number]: HTMLElement | null }>({});

  const getAttributeValues = (attributeType: string): string[] => {
    const attributeValueMap: Record<string, string[]> = {
      color: ["Red", "Blue", "Green"],
      size: ["S", "M", "L"],
      material: ["Cotton", "Polyester"],
    };
    return (
      attributeValueMap[attributeType] || ["Value 1", "Value 2", "Value 3"]
    );
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
      <header className='bg-transparent border-none'>
        <div className='max-w-7xl mx-auto px-6 pt-10 pb-2'>
          <div className='flex flex-col md:flex-row md:items-end justify-between gap-6'>
            <div className='space-y-4'>
              <div className='flex items-center gap-4'>
                <div className='w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-blue-600'>
                  <Package className='w-7 h-7' />
                </div>
                <div>
                  <div className='flex items-center gap-3'>
                    <h1 className='text-3xl font-black text-gray-900 tracking-tight'>
                      Create New Product
                    </h1>
                    <Badge className='bg-blue-100 text-blue-700 border-none hover:bg-blue-200 px-3 py-0.5 rounded-full text-xs font-bold'>
                      DRAFT
                    </Badge>
                  </div>
                </div>
              </div>

              <div className='flex flex-wrap items-center gap-3'>
                {attachments.length > 0 && (
                  <div className='flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm text-xs font-bold text-gray-600'>
                    <Upload className='w-3.5 h-3.5 text-blue-500' />
                    {attachments.length} ATTACHMENTS
                  </div>
                )}
                {filledBarcodesCount > 0 && (
                  <div className='flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm text-xs font-bold text-gray-600'>
                    <Barcode className='w-3.5 h-3.5 text-blue-500' />
                    {filledBarcodesCount} BARCODES
                  </div>
                )}
                {photoRows.length > 0 && (
                  <div className='flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm text-xs font-bold text-gray-600'>
                    <DollarSign className='w-3.5 h-3.5 text-blue-500' />
                    {units.length} UNITS
                  </div>
                )}
              </div>
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
          {/* Horizontal tabs layout */}
          <div className='bg-white border border-gray-200 rounded-xl overflow-hidden'>
            <TabsList className='flex flex-row h-auto w-full rounded-none bg-gray-50 p-0 border-b border-gray-200 overflow-x-auto'>
              <TabsTrigger
                value='basic'
                className='relative flex-shrink-0 justify-center gap-2 rounded-none px-4 py-3 text-sm font-medium text-gray-700 border-r border-gray-200 hover:bg-gray-100 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-blue-600'
              >
                <Package className='w-4 h-4' />
                General Information
              </TabsTrigger>
              <TabsTrigger
                value='codes'
                className='relative flex-shrink-0 justify-center gap-2 rounded-none px-4 py-3 text-sm font-medium text-gray-700 border-r border-gray-200 hover:bg-gray-100 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-blue-600'
              >
                <Barcode className='w-4 h-4' />
                Discount
              </TabsTrigger>
              <TabsTrigger
                value='details'
                className='relative flex-shrink-0 justify-center gap-2 rounded-none px-4 py-3 text-sm font-medium text-gray-700 border-r border-gray-200 hover:bg-gray-100 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-blue-600'
              >
                <FileText className='w-4 h-4' />
                Attributes & Variants
              </TabsTrigger>
              <TabsTrigger
                value='pricing'
                className='relative flex-shrink-0 justify-center gap-2 rounded-none px-4 py-3 text-sm font-medium text-gray-700 border-r border-gray-200 hover:bg-gray-100 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-blue-600'
              >
                <DollarSign className='w-4 h-4' />
                Additional Information
              </TabsTrigger>
              <TabsTrigger
                value='variants'
                className='relative flex-shrink-0 justify-center gap-2 rounded-none px-4 py-3 text-sm font-medium text-gray-700 border-r border-gray-200 hover:bg-gray-100 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-blue-600'
              >
                <Settings className='w-4 h-4' />
                Compo
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
                        <div className='space-y-3'>
                          <Label className='text-sm font-medium text-gray-900'>
                            Product Type
                          </Label>
                          <RadioGroup
                            className='grid grid-cols-1 md:grid-cols-3 gap-4'
                            value={formData.productType}
                            onValueChange={(value) =>
                              updateFormData(
                                "productType",
                                value as ProductType,
                              )
                            }
                          >
                            {[
                              {
                                id: "inventory",
                                label: "Inventory",
                                desc: "Physical goods you track.",
                              },
                              {
                                id: "service",
                                label: "Service",
                                desc: "Services or labor.",
                              },
                              {
                                id: "compo",
                                label: "Compo",
                                desc: "Composite products.",
                              },
                            ].map((item) => (
                              <Label
                                key={item.id}
                                htmlFor={`type-${item.id}`}
                                className={`relative flex flex-col justify-between p-4 h-full rounded-2xl border-2 transition-all cursor-pointer group ${
                                  formData.productType === item.id
                                    ? "bg-blue-50 border-blue-600 shadow-sm"
                                    : "bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                                }`}
                              >
                                <div className='flex items-start justify-between w-full'>
                                  <span
                                    className={`font-bold transition-colors ${
                                      formData.productType === item.id
                                        ? "text-blue-900"
                                        : "text-gray-900"
                                    }`}
                                  >
                                    {item.label}
                                  </span>
                                  <RadioGroupItem
                                    value={item.id}
                                    id={`type-${item.id}`}
                                    className={`h-5 w-5 ${
                                      formData.productType === item.id
                                        ? "border-blue-600 text-blue-600"
                                        : "border-gray-300"
                                    }`}
                                  />
                                </div>
                              </Label>
                            ))}
                          </RadioGroup>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                          <div className='space-y-2'>
                            <Label htmlFor='total-quantity'>
                              Total Quantity
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
                          <div className='space-y-2'>
                            <Label htmlFor='purchase-price'>Cost</Label>
                            <Input
                              id='purchase-price'
                              type='number'
                              value={formData.purchasePrice}
                              onChange={(e) =>
                                updateFormData("purchasePrice", e.target.value)
                              }
                              placeholder='0.00'
                            />
                          </div>
                        </div>

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
                                <SelectItem value='vat-15'>VAT 15%</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className='space-y-2'>
                            <Label htmlFor='purchase-tax'>Purchase Taxes</Label>
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
                                <SelectItem value='vat-15'>VAT 15%</SelectItem>
                              </SelectContent>
                            </Select>
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

                        <div className='grid grid-cols-2 gap-4'>
                          <div
                            className='flex items-center justify-between rounded-md border border-gray-200 px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors'
                            onClick={() =>
                              updateFormData(
                                "salesEnabled",
                                !formData.salesEnabled,
                              )
                            }
                          >
                            <div>
                              <Label className='text-sm cursor-pointer'>
                                Sales
                              </Label>
                            </div>
                            <Switch
                              checked={formData.salesEnabled}
                              onCheckedChange={(checked) =>
                                updateFormData("salesEnabled", checked)
                              }
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div
                            className='flex items-center justify-between rounded-md border border-gray-200 px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors'
                            onClick={() =>
                              updateFormData(
                                "purchaseEnabled",
                                !formData.purchaseEnabled,
                              )
                            }
                          >
                            <div>
                              <Label className='text-sm cursor-pointer'>
                                Purchase
                              </Label>
                            </div>
                            <Switch
                              checked={formData.purchaseEnabled}
                              onCheckedChange={(checked) =>
                                updateFormData("purchaseEnabled", checked)
                              }
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                      </div>

                      <div className='space-y-4'>
                        <div className='space-y-2'>
                          <Card className='shadow-none border-none gap-0'>
                            <CardHeader className='p-0'>
                              <div className='flex items-center justify-between gap-4'>
                                <div>
                                  <CardTitle className='text-base'>
                                    Attachments
                                  </CardTitle>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className='space-y-6 p-0'>
                              {photoRows.length === 0 ? (
                                <div
                                  className={`flex flex-col items-center justify-center py-3 border-2 border-dashed rounded-xl transition-all duration-200 ${
                                    isDragging
                                      ? "border-blue-500 bg-blue-50"
                                      : "border-gray-200 bg-gray-50/50 hover:bg-gray-50"
                                  }`}
                                  onDragOver={(e) => {
                                    e.preventDefault();
                                    setIsDragging(true);
                                  }}
                                  onDragLeave={() => setIsDragging(false)}
                                  onDrop={handlePhotoDrop}
                                >
                                  <div className='w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4'>
                                    <Upload
                                      className={`w-6 h-6 ${isDragging ? "text-blue-500 animate-bounce" : "text-gray-400"}`}
                                    />
                                  </div>
                                  <h3 className='text-sm font-medium text-gray-900'>
                                    {isDragging
                                      ? "Drop to upload photo"
                                      : "No photos added"}
                                  </h3>
                                  <p className='text-xs text-gray-500 mt-1 mb-4'>
                                    Drag & drop or click to add product photos
                                  </p>
                                  <div className='relative'>
                                    <Button
                                      type='button'
                                      size='sm'
                                      className='gap-2 pointer-events-none'
                                    >
                                      <Plus className='w-4 h-4' />
                                      Select Photo
                                    </Button>
                                    <input
                                      type='file'
                                      accept='image/*'
                                      className='absolute inset-0 opacity-0 cursor-pointer'
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const previewUrl =
                                            URL.createObjectURL(file);
                                          setPhotoRows([
                                            {
                                              id: 1,
                                              file,
                                              previewUrl,
                                              description: "",
                                            },
                                          ]);
                                        }
                                      }}
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div className='flex flex-col md:flex-row gap-6'>
                                  {/* Primary Photo Preview Main */}
                                  <div className='flex-1'>
                                    <div className='group relative w-full border border-gray-200 bg-gray-50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300'>
                                      <div className='absolute top-3 left-3 z-20 flex gap-2'>
                                        <Badge className='bg-blue-600 text-white border-none shadow-sm px-2.5 py-1'>
                                          {activePreviewIndex === 0
                                            ? "Primary"
                                            : `Image ${activePreviewIndex + 1}`}
                                        </Badge>
                                      </div>

                                      {photoRows[activePreviewIndex]
                                        ?.previewUrl ? (
                                        <>
                                          <img
                                            src={
                                              photoRows[activePreviewIndex]
                                                .previewUrl
                                            }
                                            alt={`Preview ${activePreviewIndex}`}
                                            className='w-full h-full object-contain transition-transform duration-500 cursor-pointer hover:scale-[1.01]'
                                            onClick={() =>
                                              setDialogPreviewIndex(
                                                activePreviewIndex,
                                              )
                                            }
                                          />

                                          {/* Navigation Overlay Arrows */}
                                          {photoRows.length > 1 && (
                                            <div className='absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none'>
                                              <Button
                                                variant='ghost'
                                                size='icon'
                                                className='w-10 h-10 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-lg border border-gray-200 backdrop-blur-sm pointer-events-auto'
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setActivePreviewIndex(
                                                    (prev) =>
                                                      (prev -
                                                        1 +
                                                        photoRows.length) %
                                                      photoRows.length,
                                                  );
                                                }}
                                              >
                                                <ChevronLeft className='w-6 h-6' />
                                              </Button>
                                              <Button
                                                variant='ghost'
                                                size='icon'
                                                className='w-10 h-10 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-lg border border-gray-200 backdrop-blur-sm pointer-events-auto'
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setActivePreviewIndex(
                                                    (prev) =>
                                                      (prev + 1) %
                                                      photoRows.length,
                                                  );
                                                }}
                                              >
                                                <ChevronRight className='w-6 h-6' />
                                              </Button>
                                            </div>
                                          )}
                                        </>
                                      ) : (
                                        <div className='w-full h-full flex flex-col items-center justify-center p-8 text-center'>
                                          <div className='w-14 h-14 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform'>
                                            <Upload className='w-7 h-7 text-gray-400' />
                                          </div>
                                          <p className='text-sm font-medium text-gray-900'>
                                            Upload Photo
                                          </p>
                                        </div>
                                      )}

                                      {photoRows[activePreviewIndex] && (
                                        <div className='absolute top-3 right-3 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                                          <Button
                                            type='button'
                                            variant='destructive'
                                            size='icon'
                                            className='w-9 h-9 shadow-lg rounded-full bg-red-500 hover:bg-red-600 text-white border-none'
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const idToRemove =
                                                photoRows[activePreviewIndex]
                                                  .id;
                                              removePhotoRow(idToRemove);
                                              setActivePreviewIndex(0);
                                            }}
                                          >
                                            <X className='w-4 h-4' />
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  {/* Other Photos Thumbnails Sidebar */}
                                  <div className='w-full md:w-24 flex flex-row md:flex-col gap-3 overflow-x-auto md:overflow-y-auto scrollbar-hide pb-2 md:pb-0 pr-0 md:pr-1 max-h-[500px]'>
                                    {photoRows.map((row, index) => (
                                      <div
                                        key={row.id}
                                        className={`group flex-shrink-0 relative w-16 h-16 md:w-20 md:h-20 bg-white border rounded-xl overflow-hidden transition-all duration-300 ${
                                          activePreviewIndex === index
                                            ? "ring-2 ring-blue-500 ring-offset-2 scale-105 shadow-md"
                                            : "border-gray-200 hover:border-blue-300 hover:scale-105"
                                        }`}
                                      >
                                        {row.previewUrl ? (
                                          <>
                                            <img
                                              src={row.previewUrl}
                                              alt={`Gallery ${index}`}
                                              className='w-full h-full object-cover cursor-pointer'
                                              onClick={() => {
                                                setActivePreviewIndex(index);
                                                setDialogPreviewIndex(index);
                                              }}
                                            />

                                            {/* Action Buttons */}
                                            <div className='absolute inset-x-0 top-0 p-1 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity z-30'>
                                              {index !== 0 ? (
                                                <Button
                                                  type='button'
                                                  variant='secondary'
                                                  size='icon'
                                                  className='w-6 h-6 rounded-md bg-white/90 hover:bg-white text-blue-600 border-none shadow-sm'
                                                  title='Set as Primary'
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    makePhotoPrimary(index);
                                                  }}
                                                >
                                                  <Star className='w-3.5 h-3.5' />
                                                </Button>
                                              ) : (
                                                <div />
                                              )}
                                              <Button
                                                type='button'
                                                variant='destructive'
                                                size='icon'
                                                className='w-6 h-6 rounded-md bg-red-500/90 hover:bg-red-500 text-white border-none shadow-sm'
                                                title='Delete'
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  removePhotoRow(row.id);
                                                  if (
                                                    activePreviewIndex === index
                                                  )
                                                    setActivePreviewIndex(0);
                                                }}
                                              >
                                                <X className='w-3.5 h-3.5' />
                                              </Button>
                                            </div>

                                            {index === 0 && (
                                              <div className='absolute bottom-0 left-0 right-0 bg-blue-600 text-[8px] text-white text-center py-0.5 font-bold uppercase tracking-tighter'>
                                                Primary
                                              </div>
                                            )}
                                          </>
                                        ) : (
                                          <div className='w-full h-full flex flex-col items-center justify-center bg-gray-50/50'>
                                            <Upload className='w-3 h-3 text-gray-400' />
                                            <input
                                              type='file'
                                              accept='image/*'
                                              className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10'
                                              onChange={(e) =>
                                                handlePhotoFileChange(row.id, e)
                                              }
                                            />
                                          </div>
                                        )}
                                      </div>
                                    ))}

                                    <button
                                      type='button'
                                      onClick={addPhotoRow}
                                      className='flex-shrink-0 w-16 h-16 md:w-20 md:h-20 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/30 hover:bg-gray-50 hover:border-blue-200 transition-all group'
                                    >
                                      <Plus className='w-6 h-6 text-gray-400 group-hover:text-blue-600' />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </CardContent>

                            {/* Photo Preview Dialog */}
                            <Dialog
                              open={dialogPreviewIndex !== null}
                              onOpenChange={() => setDialogPreviewIndex(null)}
                            >
                              <DialogContent className='max-w-5xl border-none bg-black/95 shadow-none p-0 overflow-hidden sm:rounded-3xl'>
                                <div className='relative w-full h-[85vh] flex flex-col'>
                                  {/* Close Button */}
                                  <Button
                                    variant='ghost'
                                    size='icon'
                                    className='absolute top-4 right-4 z-[60] w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md transition-all'
                                    onClick={() => setDialogPreviewIndex(null)}
                                  >
                                    <X className='w-5 h-5' />
                                  </Button>

                                  {/* Navigation Header */}
                                  <div className='absolute top-4 left-0 right-0 z-50 flex justify-center px-6 pointer-events-none'>
                                    <div className='flex items-center gap-3 bg-black/40 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10 pointer-events-auto shadow-2xl'>
                                      <p className='text-xs font-bold text-white uppercase tracking-[0.2em]'>
                                        {dialogPreviewIndex !== null
                                          ? dialogPreviewIndex + 1
                                          : 0}{" "}
                                        <span className='text-white/40 mx-1'>
                                          /
                                        </span>{" "}
                                        {photoRows.length}
                                      </p>
                                      {dialogPreviewIndex === 0 && (
                                        <Badge className='bg-blue-600 text-[10px] h-5 px-2 border-none shadow-sm'>
                                          Primary
                                        </Badge>
                                      )}
                                    </div>
                                  </div>

                                  {/* Main Image Area */}
                                  <div className='flex-1 relative flex items-center justify-center p-6 md:p-12'>
                                    {/* Navigation Arrows */}
                                    {photoRows.length > 1 && (
                                      <>
                                        <Button
                                          variant='ghost'
                                          size='icon'
                                          className='absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/5 hover:bg-white/15 text-white border border-white/10 backdrop-blur-lg transition-all z-50'
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setDialogPreviewIndex((prev) =>
                                              prev !== null
                                                ? (prev -
                                                    1 +
                                                    photoRows.length) %
                                                  photoRows.length
                                                : null,
                                            );
                                          }}
                                        >
                                          <ChevronLeft className='w-8 h-8' />
                                        </Button>
                                        <Button
                                          variant='ghost'
                                          size='icon'
                                          className='absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/5 hover:bg-white/15 text-white border border-white/10 backdrop-blur-lg transition-all z-50'
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setDialogPreviewIndex((prev) =>
                                              prev !== null
                                                ? (prev + 1) % photoRows.length
                                                : null,
                                            );
                                          }}
                                        >
                                          <ChevronRight className='w-8 h-8' />
                                        </Button>
                                      </>
                                    )}

                                    {dialogPreviewIndex !== null &&
                                      photoRows[dialogPreviewIndex]
                                        ?.previewUrl && (
                                        <img
                                          src={
                                            photoRows[dialogPreviewIndex]
                                              .previewUrl
                                          }
                                          alt='Full preview'
                                          className='max-w-full max-h-full object-contain animate-in zoom-in-95 fade-in duration-300 shadow-2xl'
                                        />
                                      )}
                                  </div>

                                  {/* Thumbnail Strip & Actions Footer */}
                                  <div className='bg-black/60 backdrop-blur-2xl border-t border-white/10 p-6 space-y-6'>
                                    {/* Thumbnail Strip */}
                                    {photoRows.length > 1 && (
                                      <div className='flex justify-center gap-3 overflow-x-auto py-2 scrollbar-hide max-w-2xl mx-auto'>
                                        {photoRows.map((row, idx) => (
                                          <button
                                            key={row.id}
                                            onClick={() =>
                                              setDialogPreviewIndex(idx)
                                            }
                                            className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                                              dialogPreviewIndex === idx
                                                ? "border-blue-500 ring-2 ring-blue-500/50 scale-110 shadow-lg"
                                                : "border-white/10 opacity-40 hover:opacity-100 hover:border-white/30"
                                            }`}
                                          >
                                            <img
                                              src={row.previewUrl}
                                              className='w-full h-full object-cover'
                                              alt=''
                                            />
                                            {idx === 0 && (
                                              <div className='absolute bottom-0 inset-x-0 bg-blue-600 text-[6px] font-bold text-white py-0.5 text-center uppercase'>
                                                Primary
                                              </div>
                                            )}
                                          </button>
                                        ))}
                                      </div>
                                    )}

                                    {/* Bottom Actions */}
                                    <div className='max-w-xl mx-auto flex items-center justify-center gap-4'>
                                      {dialogPreviewIndex !== null &&
                                        dialogPreviewIndex !== 0 && (
                                          <Button
                                            className='bg-blue-600 hover:bg-blue-700 text-white rounded-full px-10 gap-2 h-12 font-bold shadow-xl shadow-blue-600/30 transition-all hover:scale-105 active:scale-95'
                                            onClick={() => {
                                              makePhotoPrimary(
                                                dialogPreviewIndex,
                                              );
                                              setDialogPreviewIndex(0);
                                            }}
                                          >
                                            <Star className='w-5 h-5 fill-current' />
                                            Set as Primary Photo
                                          </Button>
                                        )}
                                      <Button
                                        variant='outline'
                                        className='bg-white/5 border-white/10 text-white hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/50 rounded-full px-10 gap-2 h-12 font-bold transition-all'
                                        onClick={() => {
                                          if (dialogPreviewIndex !== null) {
                                            const idToRemove =
                                              photoRows[dialogPreviewIndex].id;
                                            removePhotoRow(idToRemove);
                                            if (photoRows.length <= 1)
                                              setDialogPreviewIndex(null);
                                            else
                                              setDialogPreviewIndex(
                                                Math.max(
                                                  0,
                                                  dialogPreviewIndex - 1,
                                                ),
                                              );
                                          }
                                        }}
                                      >
                                        <X className='w-5 h-5' />
                                        Remove Photo
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </Card>
                        </div>
                        <div className='space-y-4'>
                          <div className='flex items-center justify-between'>
                            <div>
                              <Label>Cost Centers</Label>
                              <p className='text-xs text-gray-500'>
                                Add multiple cost centers.
                              </p>
                            </div>
                            <Button
                              type='button'
                              size='sm'
                              variant='outline'
                              onClick={addCostCenter}
                            >
                              <Plus className='w-4 h-4 mr-1' />
                              Add
                            </Button>
                          </div>
                          <div className='space-y-2'>
                            {costCenters.map((cc, index) => (
                              <div
                                key={index}
                                className='flex items-center gap-2'
                              >
                                <Select
                                  value={cc}
                                  onValueChange={(value) =>
                                    updateCostCenter(index, value)
                                  }
                                >
                                  <SelectTrigger className='w-full'>
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
                                <Input placeholder='Percentage' />

                                {costCenters.length > 1 && (
                                  <Button
                                    type='button'
                                    variant='ghost'
                                    size='icon'
                                    onClick={() => removeCostCenter(index)}
                                  >
                                    <Trash2 className='w-4 h-4 text-red-500' />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className='space-y-4'>
                          <div className='flex items-center justify-between'>
                            <div>
                              <Label>Barcodes</Label>
                              <p className='text-xs text-gray-500'>
                                Add multiple barcodes.
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
                      </div>
                    </div>

                    <Separator />

                    <div className='grid grid-cols-1 gap-6'>
                      <div className='space-y-4'>
                        <div className='flex items-center justify-between'>
                          <div>
                            <Label>Units</Label>
                            <p className='text-xs text-gray-500'>
                              Add multiple units and their prices.
                            </p>
                          </div>
                          <Button
                            type='button'
                            size='sm'
                            variant='outline'
                            onClick={addUnit}
                          >
                            <Plus className='w-4 h-4 mr-1' />
                            Add Unit
                          </Button>
                        </div>
                        <div className='overflow-x-auto rounded-xl border border-gray-200'>
                          <table className='w-full text-sm text-left border-collapse min-w-[1000px]'>
                            <thead className='bg-gray-50 border-b border-gray-200'>
                              <tr>
                                <th className='px-4 py-3 font-bold text-gray-700 uppercase text-[10px]'>
                                  Packing
                                </th>
                                <th className='px-4 py-3 font-bold text-gray-700 uppercase text-[10px]'>
                                  Parts
                                </th>
                                <th className='px-4 py-3 font-bold text-gray-700 uppercase text-[10px] text-center'>
                                  Default Sales
                                </th>
                                <th className='px-4 py-3 font-bold text-gray-700 uppercase text-[10px] text-center'>
                                  Default Purchases
                                </th>
                                <th className='px-4 py-3 font-bold text-gray-700 uppercase text-[10px]'>
                                  Last Cost
                                </th>
                                <th className='px-4 py-3 font-bold text-gray-700 uppercase text-[10px]'>
                                  Avg Cost
                                </th>
                                {/* Dynamic Price Headers */}
                                {units.length > 0 &&
                                  units[0].salesPrices.map((price) => (
                                    <th
                                      key={price.id}
                                      className='px-4 py-3 font-bold text-gray-700 uppercase text-[10px] min-w-[100px]'
                                    >
                                      {price.name}
                                    </th>
                                  ))}
                                <th className='px-4 py-3 font-bold text-gray-700 uppercase text-[10px] text-center'>
                                  Action
                                </th>
                              </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-100 bg-white'>
                              {units.map((unit, index) => (
                                <Fragment key={unit.id}>
                                  <tr
                                    key={unit.id}
                                    className='hover:bg-gray-50/50 transition-colors'
                                  >
                                    <td className='px-3 py-2'>
                                      <Input
                                        placeholder='Packing'
                                        value={unit.packingUnits}
                                        onChange={(e) =>
                                          updateUnit(
                                            unit.id,
                                            "packingUnits",
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </td>
                                    <td className='px-3 py-2 w-40'>
                                      <div className='flex items-center gap-2'>
                                        <Input
                                          type='number'
                                          placeholder='0'
                                          value={unit.partsCount}
                                          onChange={(e) =>
                                            updateUnit(
                                              unit.id,
                                              "partsCount",
                                              e.target.value,
                                            )
                                          }
                                        />
                                        {index !== 0 && (
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Info className='w-5 h-5   text-muted-foreground' />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              {unit.partsCount || "0"} ×{" "}
                                              {unit.packingUnits || "unit"}
                                            </TooltipContent>
                                          </Tooltip>
                                        )}
                                      </div>
                                    </td>
                                    <td className='px-3 py-2'>
                                      <div className='flex items-center justify-center gap-4'>
                                        {/* Sales Radio */}
                                        <div
                                          className='flex flex-col items-center gap-1 cursor-pointer group/radio'
                                          onClick={() =>
                                            updateUnit(
                                              unit.id,
                                              "isDefaultSales",
                                              true,
                                            )
                                          }
                                        >
                                          <div
                                            className={`h-4 w-4 rounded-full border flex items-center justify-center transition-all ${
                                              unit.isDefaultSales
                                                ? "border-blue-600 bg-white"
                                                : "border-gray-300 bg-white group-hover/radio:border-blue-400"
                                            }`}
                                          >
                                            {unit.isDefaultSales && (
                                              <div className='h-2 w-2 rounded-full bg-blue-600 animate-in zoom-in-50 duration-200' />
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className='px-3 py-2'>
                                      <div className='flex items-center justify-center gap-4'>
                                        {/* Purchase Radio */}
                                        <div
                                          className='flex flex-col items-center gap-1 cursor-pointer group/radio'
                                          onClick={() =>
                                            updateUnit(
                                              unit.id,
                                              "isDefaultPurchases",
                                              true,
                                            )
                                          }
                                        >
                                          <div
                                            className={`h-4 w-4 rounded-full border flex items-center justify-center transition-all ${
                                              unit.isDefaultPurchases
                                                ? "border-blue-600 bg-white"
                                                : "border-gray-300 bg-white group-hover/radio:border-blue-400"
                                            }`}
                                          >
                                            {unit.isDefaultPurchases && (
                                              <div className='h-2 w-2 rounded-full bg-blue-600 animate-in zoom-in-50 duration-200' />
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className='px-3 py-2 w-28'>
                                      <Input
                                        type='number'
                                        placeholder='0.00'
                                        value={unit.lastCostPrice}
                                        onChange={(e) =>
                                          updateUnit(
                                            unit.id,
                                            "lastCostPrice",
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </td>
                                    <td className='px-3 py-2 w-28'>
                                      <Input
                                        type='number'
                                        placeholder='0.00'
                                        value={unit.avgCostPrice}
                                        onChange={(e) =>
                                          updateUnit(
                                            unit.id,
                                            "avgCostPrice",
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </td>
                                    {/* Inline Price Inputs */}
                                    {unit.salesPrices.map((price) => (
                                      <td key={price.id} className='px-3 py-2'>
                                        <Input
                                          type='number'
                                          placeholder='0.00'
                                          value={price.price}
                                          onChange={(e) => {
                                            const newVal =
                                              parseFloat(e.target.value) || 0;
                                            const updatedSalesPrices =
                                              unit.salesPrices.map((sp) =>
                                                sp.id === price.id
                                                  ? { ...sp, price: newVal }
                                                  : sp,
                                              );
                                            updateUnit(
                                              unit.id,
                                              "salesPrices",
                                              updatedSalesPrices,
                                            );
                                          }}
                                        />
                                      </td>
                                    ))}
                                    <td className='px-3 py-2 text-center'>
                                      {units.length > 1 && (
                                        <Button
                                          type='button'
                                          variant='ghost'
                                          size='icon'
                                          className='h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md'
                                          onClick={() => removeUnit(unit.id)}
                                        >
                                          <Trash2 className='w-4 h-4' />
                                        </Button>
                                      )}
                                    </td>
                                  </tr>
                                </Fragment>
                              ))}
                            </tbody>
                          </table>
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
                    <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
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
                      <div className='space-y-2'>
                        <Label htmlFor='default-discount'>Discount Type</Label>
                        <Select
                          value={formData.discountType}
                          onValueChange={(value) =>
                            updateFormData("discountType", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='percentage'>
                              Percentage (%)
                            </SelectItem>
                            <SelectItem value='fixed'>Fixed Amount</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div
                      className='flex items-center justify-between rounded-md border border-gray-200 px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors'
                      onClick={() =>
                        updateFormData(
                          "basedOnSellingPrice",
                          !formData.basedOnSellingPrice,
                        )
                      }
                    >
                      <div>
                        <Label className='text-sm cursor-pointer'>
                          Is Discount Based On Selling Price
                        </Label>
                      </div>
                      <Switch
                        checked={formData.basedOnSellingPrice}
                        onCheckedChange={(checked) =>
                          updateFormData("basedOnSellingPrice", checked)
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    {formData.basedOnSellingPrice && (
                      <div className='space-y-4'>
                        <div className='flex items-center justify-between'>
                          <Label className='text-base font-semibold'>
                            Discounts Table
                          </Label>
                          <Button
                            type='button'
                            size='sm'
                            variant='outline'
                            onClick={addPriceDiscountRow}
                          >
                            <Plus className='w-4 h-4 mr-1' />
                            Add Row
                          </Button>
                        </div>

                        <div className='overflow-hidden rounded-xl border border-gray-200'>
                          <table className='w-full text-sm text-left border-collapse'>
                            <thead className='bg-gray-50 border-b border-gray-200'>
                              <tr>
                                <th className='px-4 py-3 font-bold text-gray-700 uppercase text-[10px]'>
                                  Name
                                </th>
                                <th className='px-4 py-3 font-bold text-gray-700 uppercase text-[10px]'>
                                  Discount Value
                                </th>
                                <th className='px-4 py-3 font-bold text-gray-700 uppercase text-[10px]'>
                                  Type
                                </th>
                                <th className='px-4 py-3 font-bold text-gray-700 uppercase text-[10px] text-center w-20'>
                                  Action
                                </th>
                              </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-100 bg-white'>
                              {priceDiscountRows.length === 0 ? (
                                <tr>
                                  <td
                                    colSpan={4}
                                    className='px-4 py-8 text-center text-gray-500 italic'
                                  >
                                    No rows added yet. Click "Add Row" to begin.
                                  </td>
                                </tr>
                              ) : (
                                priceDiscountRows.map((row) => (
                                  <tr
                                    key={row.id}
                                    className='hover:bg-gray-50/50 transition-colors'
                                  >
                                    <td className='px-3 py-2'>
                                      <Input
                                        placeholder='Name'
                                        value={row.name}
                                        onChange={(e) =>
                                          updatePriceDiscountRow(
                                            row.id,
                                            "name",
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </td>
                                    <td className='px-3 py-2'>
                                      <Input
                                        type='number'
                                        placeholder='0.00'
                                        value={row.discount}
                                        onChange={(e) =>
                                          updatePriceDiscountRow(
                                            row.id,
                                            "discount",
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </td>
                                    <td className='px-3 py-2'>
                                      <Select
                                        value={row.discountType}
                                        onValueChange={(value) =>
                                          updatePriceDiscountRow(
                                            row.id,
                                            "discountType",
                                            value,
                                          )
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value='percentage'>
                                            Percentage (%)
                                          </SelectItem>
                                          <SelectItem value='fixed'>
                                            Fixed Amount
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </td>
                                    <td className='px-3 py-2 text-center'>
                                      <Button
                                        type='button'
                                        variant='ghost'
                                        size='icon'
                                        className='h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md'
                                        onClick={() =>
                                          removePriceDiscountRow(row.id)
                                        }
                                      >
                                        <Trash2 className='w-4 h-4' />
                                      </Button>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
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
                      <div className='rounded-lg border border-gray-200'>
                        <div className='min-w-[720px]'>
                          <div className='grid grid-cols-[1fr_2fr_80px_80px] bg-gray-50 border-b border-gray-200'>
                            <div className='px-4 py-3 text-sm font-medium text-gray-700'>
                              Attribute
                            </div>
                            <div className='px-4 py-3 text-sm font-medium text-gray-700'>
                              Values
                            </div>
                            <div className='px-4 py-3 text-sm font-medium text-gray-700 text-center'>
                              Apply
                            </div>
                            <div className='px-4 py-3 text-sm font-medium text-gray-700 text-center'>
                              Actions
                            </div>
                          </div>
                          {attributeRows.map((row) => (
                            <div
                              key={row.id}
                              className={`grid grid-cols-[1fr_2fr_80px_80px] border-b border-gray-100 last:border-b-0 ${
                                !row.isApply ? "opacity-60" : ""
                              }`}
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
                                    <SelectItem value='color'>Color</SelectItem>
                                    <SelectItem value='size'>Size</SelectItem>
                                    <SelectItem value='material'>
                                      Material
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className='px-4 py-3'>
                                <div className='space-y-2'>
                                  <div className='relative multi-select-dropdown'>
                                    <div
                                      ref={(el) => {
                                        dropdownRefs.current[row.id] = el;
                                      }}
                                      className='min-h-[38px] px-3 py-2 border border-gray-200 rounded-md bg-white cursor-pointer hover:border-gray-300 transition-colors'
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (openDropdownId === row.id) {
                                          setOpenDropdownId(null);
                                        } else {
                                          const rect =
                                            e.currentTarget.getBoundingClientRect();
                                          setDropdownPosition({
                                            top: rect.bottom,
                                            left: rect.left,
                                            width: rect.width,
                                          });
                                          setOpenDropdownId(row.id);
                                        }
                                      }}
                                    >
                                      <div className='flex items-center justify-between'>
                                        <div className='flex flex-wrap gap-1'>
                                          {row.values.length === 0 ? (
                                            <span className='text-gray-400 text-sm'>
                                              Select values...
                                            </span>
                                          ) : (
                                            row.values.map((value) => (
                                              <Badge
                                                key={value}
                                                variant='secondary'
                                                className='text-[10px] px-1 py-0.1 bg-blue-50 text-blue-700 border-blue-200'
                                              >
                                                {value}
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeAttributeValue(
                                                      row.id,
                                                      value,
                                                    );
                                                  }}
                                                  className='ml-1 hover:text-red-500 transition-colors font-bold'
                                                >
                                                  ×
                                                </button>
                                              </Badge>
                                            ))
                                          )}
                                        </div>
                                        <ChevronDown className='w-4 h-4 text-gray-400' />
                                      </div>
                                    </div>

                                    {/* Dropdown Content - Absolute positioned */}
                                    {openDropdownId === row.id && (
                                      <div
                                        className='absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg'
                                        style={{ zIndex: 9999 }}
                                      >
                                        <div className='max-h-60 overflow-y-auto p-2'>
                                          <div className='py-1'>
                                            {getAttributeValues(
                                              row.attribute,
                                            ).map((value) => (
                                              <div
                                                key={value}
                                                className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${
                                                  row.values.includes(value)
                                                    ? "bg-blue-50 text-blue-700"
                                                    : "text-gray-700"
                                                }`}
                                                onClick={(e) =>
                                                  toggleAttributeValue(
                                                    e,
                                                    row.id,
                                                    value,
                                                  )
                                                }
                                              >
                                                <div className='flex items-center justify-between'>
                                                  <span>{value}</span>
                                                  {row.values.includes(
                                                    value,
                                                  ) && (
                                                    <div className='w-4 h-4 bg-blue-600 rounded flex items-center justify-center'>
                                                      <svg
                                                        className='w-3 h-3 text-white'
                                                        fill='currentColor'
                                                        viewBox='0 0 20 20'
                                                      >
                                                        <path
                                                          fillRule='evenodd'
                                                          d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                                          clipRule='evenodd'
                                                        />
                                                      </svg>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className='px-4 py-3 flex items-center justify-center'>
                                <Checkbox
                                  checked={row.isApply}
                                  onCheckedChange={() =>
                                    toggleAttributeRowApply(row.id)
                                  }
                                />
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

                {/* Attribute Combinations */}
                {formData.productType !== "compo" && (
                  <Card className='shadow-sm hover:shadow-md transition-shadow'>
                    <CardHeader>
                      <div className='flex items-center justify-between gap-4'>
                        <div>
                          <CardTitle>Attribute Combinations</CardTitle>
                          <CardDescription>
                            Generated variants based on your attributes.
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {attributeCombinations.length === 0 ? (
                        <div className='rounded-lg border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500'>
                          {attributeRows.length === 0
                            ? "Add attributes first to generate combinations."
                            : "Click 'Generate Combinations' to create variants."}
                        </div>
                      ) : (
                        <div className='space-y-4'>
                          <div className='flex items-center justify-between'>
                            <p className='text-sm text-gray-600'>
                              Generated{" "}
                              <span className='font-semibold'>
                                {attributeCombinations.length}
                              </span>{" "}
                              variant(s)
                            </p>
                          </div>
                          <div className='rounded-lg border border-gray-200'>
                            <div className='grid grid-cols-[60px_1fr_80px_80px] items-center bg-gray-50 border-b border-gray-200'>
                              <div className='px-4 py-3 text-sm font-medium text-gray-700 text-center'>
                                #
                              </div>
                              <div className='px-1 py-3 text-sm font-medium text-gray-700'>
                                Variant
                              </div>
                              <div className='px-4 py-3 text-sm font-medium text-gray-700 text-center'>
                                Apply
                              </div>
                              <div className='px-4 py-3 text-sm font-medium text-gray-700 text-center'>
                                Actions
                              </div>
                            </div>
                            <div className='max-h-64 overflow-y-auto'>
                              {attributeCombinations.map((combo, index) => (
                                <div
                                  key={combo.id}
                                  className={`grid grid-cols-[40px_1fr_80px_60px] items-center gap-3 px-3 py-2 border-b border-gray-100 last:border-b-0 transition-colors ${
                                    combo.isApply
                                      ? "bg-white hover:bg-gray-50"
                                      : "bg-gray-50 opacity-60"
                                  }`}
                                >
                                  {/* Number */}
                                  <div
                                    className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                                      combo.isApply
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-gray-200 text-gray-500"
                                    }`}
                                  >
                                    {index + 1}
                                  </div>

                                  {/* Content */}
                                  <div className='min-w-0 flex-1'>
                                    <div className='flex items-center gap-2 mb-1'>
                                      <span
                                        className={`font-medium text-sm truncate ${
                                          combo.isApply
                                            ? "text-gray-900"
                                            : "text-gray-500"
                                        }`}
                                      >
                                        {combo.name}
                                      </span>
                                      <div
                                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                          combo.isApply
                                            ? "bg-green-500"
                                            : "bg-gray-400"
                                        }`}
                                        title={
                                          combo.isApply
                                            ? "Applied"
                                            : "Not Applied"
                                        }
                                      />
                                    </div>
                                    <div className='flex flex-wrap gap-1'>
                                      {combo.attributes.map(
                                        (attr, attrIndex) => (
                                          <span
                                            key={attrIndex}
                                            className={`inline-block text-xs px-1.5 py-0.5 rounded ${
                                              combo.isApply
                                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                                : "bg-gray-100 text-gray-600 border border-gray-200"
                                            }`}
                                          >
                                            {attr.value}
                                          </span>
                                        ),
                                      )}
                                    </div>
                                  </div>

                                  {/* Checkbox */}
                                  <div className='flex justify-center'>
                                    <Checkbox
                                      checked={combo.isApply}
                                      onCheckedChange={() =>
                                        toggleAttributeComboApply(combo.id)
                                      }
                                      className='w-4 h-4'
                                    />
                                  </div>

                                  {/* Actions */}
                                  <div className='flex justify-center'>
                                    <Button
                                      type='button'
                                      variant='ghost'
                                      size='sm'
                                      onClick={() =>
                                        removeAttributeCompo(combo.id)
                                      }
                                      className='group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50'
                                    >
                                      <Trash2 className='w-3.5 h-3.5' />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Additional Info Tab */}
              <TabsContent value='pricing' className='space-y-6'>
                <Card className='shadow-sm hover:shadow-md transition-shadow'>
                  <CardHeader>
                    <CardTitle>Additional Information</CardTitle>
                    <CardDescription>Optional info.</CardDescription>
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
                            <SelectItem value='mfg1'>Manufacturer 1</SelectItem>
                            <SelectItem value='mfg2'>Manufacturer 2</SelectItem>
                            <SelectItem value='mfg3'>Manufacturer 3</SelectItem>
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
                            <SelectItem value='branch'>Branch Level</SelectItem>
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

                    <Card className='shadow-none border-none gap-2'>
                      <CardHeader className='p-0'>
                        <div className='flex items-center justify-between gap-4'>
                          <div>
                            <CardTitle className='text-base'>
                              Demand Levels
                            </CardTitle>
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
                                ? (branchDemandLevels[formData.branchId] ?? [])
                                    .length >= 5
                                : demandLevelsAll.length >= 5)
                            }
                          >
                            <Plus className='w-4 h-4 mr-1' />
                            Add Row
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className='p-0'>
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

                    <Card className='shadow-none border-none gap-2'>
                      <CardHeader className='p-0'>
                        <div className='flex items-center justify-between gap-4'>
                          <div>
                            <CardTitle className='text-base'>
                              Expiry Levels
                            </CardTitle>
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
                      <CardContent className='p-0'>
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
                                  <SelectItem value='p1'>Product 1</SelectItem>
                                  <SelectItem value='p2'>Product 2</SelectItem>
                                  <SelectItem value='p3'>Product 3</SelectItem>
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
                                  <SelectItem value='kg'>Kilograms</SelectItem>
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
            </div>
          </div>
        </Tabs>

        <div className='mt-8 flex items-center justify-end gap-4 border-t border-gray-200 pt-8'>
          <Button
            variant='outline'
            size='lg'
            className='h-12 px-8 rounded-xl font-bold transition-all hover:bg-gray-100'
            type='button'
          >
            <X className='w-5 h-5 mr-2' />
            Cancel
          </Button>
          <Button
            size='lg'
            className='h-12 px-10 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]'
            type='button'
          >
            <Save className='w-5 h-5 mr-2' />
            Save
          </Button>
        </div>
      </main>
    </div>
  );
};

export default App;
