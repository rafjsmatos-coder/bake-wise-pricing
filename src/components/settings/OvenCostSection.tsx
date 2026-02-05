 import { Label } from '@/components/ui/label';
 import { Input } from '@/components/ui/input';
 import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
 import { Flame, Zap, Info, Lightbulb } from 'lucide-react';
 import {
   HoverCard,
   HoverCardContent,
   HoverCardTrigger,
 } from '@/components/ui/hover-card';
 
 interface OvenCostSectionProps {
   ovenType: 'gas' | 'electric' | 'both';
   gasCostPerHour: number;
   electricOvenCostPerHour: number;
   defaultOvenType: 'gas' | 'electric';
   onOvenTypeChange: (value: 'gas' | 'electric' | 'both') => void;
   onGasCostChange: (value: number) => void;
   onElectricCostChange: (value: number) => void;
   onDefaultOvenTypeChange: (value: 'gas' | 'electric') => void;
   errors?: {
     gas_cost_per_hour?: { message?: string };
     electric_oven_cost_per_hour?: { message?: string };
   };
 }
 
 function MarketReference({ items }: { items: { label: string; range: string }[] }) {
   return (
     <div className="bg-muted/50 rounded-lg p-3 space-y-1.5">
       <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
         <Lightbulb className="h-3.5 w-3.5" />
         <span>Referência de mercado:</span>
       </div>
       <div className="grid gap-1">
         {items.map((item, index) => (
           <div key={index} className="flex justify-between text-sm">
             <span className="text-muted-foreground">{item.label}</span>
             <span className="font-medium text-foreground">{item.range}</span>
           </div>
         ))}
       </div>
     </div>
   );
 }
 
 function CalculationExample({ formula, example, result }: { formula: string; example: string; result: string }) {
   return (
     <div className="bg-accent/5 border border-accent/20 rounded-lg p-3 space-y-2">
       <div className="flex items-center gap-1.5 text-xs font-medium text-accent">
         <Info className="h-3.5 w-3.5" />
         <span>Como calcular:</span>
       </div>
       <div className="text-sm space-y-1">
         <p className="text-muted-foreground">{formula}</p>
         <p className="font-mono text-xs bg-background/80 rounded px-2 py-1">
           {example} = <span className="text-accent font-semibold">{result}</span>
         </p>
       </div>
     </div>
   );
 }
 
 export function OvenCostSection({
   ovenType,
   gasCostPerHour,
   electricOvenCostPerHour,
   defaultOvenType,
   onOvenTypeChange,
   onGasCostChange,
   onElectricCostChange,
   onDefaultOvenTypeChange,
   errors,
 }: OvenCostSectionProps) {
   return (
     <div className="p-6 bg-card border border-border rounded-lg space-y-4">
       <div className="flex items-start gap-3">
         <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center shrink-0">
           <Flame className="h-5 w-5 text-orange-500" />
         </div>
         <div className="flex-1 min-w-0">
           <div className="flex items-center gap-2">
             <h2 className="font-semibold">Custo do Forno (R$/h)</h2>
             <HoverCard>
               <HoverCardTrigger asChild>
                 <button type="button" className="text-muted-foreground hover:text-foreground">
                   <Info className="h-4 w-4" />
                 </button>
               </HoverCardTrigger>
               <HoverCardContent className="w-80">
                 <p className="text-sm">
                   O custo do forno é calculado automaticamente sobre o tempo de forno de cada receita.
                   Configure de acordo com o tipo de forno que você usa.
                 </p>
               </HoverCardContent>
             </HoverCard>
           </div>
           <p className="text-sm text-muted-foreground">
             Configure o custo por hora do seu forno.
           </p>
         </div>
       </div>
 
       {/* Tipo de forno */}
       <div className="space-y-3">
         <Label className="text-sm font-medium">Qual tipo de forno você usa?</Label>
         <RadioGroup
           value={ovenType}
           onValueChange={(value) => onOvenTypeChange(value as 'gas' | 'electric' | 'both')}
           className="grid gap-2"
         >
           <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer has-[:checked]:border-accent has-[:checked]:bg-accent/5">
             <RadioGroupItem value="gas" id="oven-gas" />
             <Flame className="h-4 w-4 text-orange-500" />
             <span className="flex-1">Forno a Gás</span>
           </label>
           <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer has-[:checked]:border-accent has-[:checked]:bg-accent/5">
             <RadioGroupItem value="electric" id="oven-electric" />
             <Zap className="h-4 w-4 text-yellow-500" />
             <span className="flex-1">Forno Elétrico</span>
           </label>
           <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer has-[:checked]:border-accent has-[:checked]:bg-accent/5">
             <RadioGroupItem value="both" id="oven-both" />
             <div className="flex -space-x-1">
               <Flame className="h-4 w-4 text-orange-500" />
               <Zap className="h-4 w-4 text-yellow-500" />
             </div>
             <span className="flex-1">Tenho os dois (escolher por receita)</span>
           </label>
         </RadioGroup>
       </div>
 
       {/* Campos de custo baseados no tipo */}
       {(ovenType === 'gas' || ovenType === 'both') && (
         <div className="space-y-3 animate-fade-in">
           <div className="space-y-2">
             <Label htmlFor="gas_cost_per_hour" className="flex items-center gap-2">
               <Flame className="h-3.5 w-3.5 text-orange-500" />
               Custo do forno a gás (R$/h)
             </Label>
             <Input
               id="gas_cost_per_hour"
               type="number"
               step="0.01"
               min="0"
               placeholder="2,00"
               value={gasCostPerHour || ''}
               onChange={(e) => onGasCostChange(parseFloat(e.target.value) || 0)}
             />
             {errors?.gas_cost_per_hour && (
               <p className="text-sm text-destructive">{errors.gas_cost_per_hour.message}</p>
             )}
           </div>
 
           <CalculationExample
             formula="Valor do botijão ÷ horas de uso"
             example="R$ 120 ÷ 60h"
             result="R$ 2,00/h"
           />
         </div>
       )}
 
       {(ovenType === 'electric' || ovenType === 'both') && (
         <div className="space-y-3 animate-fade-in">
           <div className="space-y-2">
             <Label htmlFor="electric_oven_cost_per_hour" className="flex items-center gap-2">
               <Zap className="h-3.5 w-3.5 text-yellow-500" />
               Custo do forno elétrico (R$/h)
             </Label>
             <Input
               id="electric_oven_cost_per_hour"
               type="number"
               step="0.01"
               min="0"
               placeholder="1,80"
               value={electricOvenCostPerHour || ''}
               onChange={(e) => onElectricCostChange(parseFloat(e.target.value) || 0)}
             />
             {errors?.electric_oven_cost_per_hour && (
               <p className="text-sm text-destructive">{errors.electric_oven_cost_per_hour.message}</p>
             )}
           </div>
 
           <CalculationExample
             formula="Consumo do forno (kWh) × tarifa da energia"
             example="2,0 kWh × R$ 0,90"
             result="R$ 1,80/h"
           />
         </div>
       )}
 
       {/* Forno padrão quando tem os dois */}
       {ovenType === 'both' && (
         <div className="space-y-3 animate-fade-in p-4 bg-muted/30 rounded-lg">
           <Label className="text-sm font-medium">Qual forno você usa com mais frequência?</Label>
           <p className="text-xs text-muted-foreground">
             Este será o padrão para novas receitas. Você pode alterar individualmente em cada receita.
           </p>
           <RadioGroup
             value={defaultOvenType}
             onValueChange={(value) => onDefaultOvenTypeChange(value as 'gas' | 'electric')}
             className="flex gap-4"
           >
             <label className="flex items-center gap-2 cursor-pointer">
               <RadioGroupItem value="gas" id="default-gas" />
               <Flame className="h-4 w-4 text-orange-500" />
               <span className="text-sm">Gás</span>
             </label>
             <label className="flex items-center gap-2 cursor-pointer">
               <RadioGroupItem value="electric" id="default-electric" />
               <Zap className="h-4 w-4 text-yellow-500" />
               <span className="text-sm">Elétrico</span>
             </label>
           </RadioGroup>
         </div>
       )}
 
       <MarketReference
         items={[
           { label: 'Forno a gás (botijão)', range: 'R$ 1,50 a R$ 2,50/h' },
           { label: 'Forno elétrico', range: 'R$ 1,50 a R$ 2,50/h' },
         ]}
       />
     </div>
   );
 }