
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { createFiscalNote } from '@/services/notesService';
import { useToast } from '@/hooks/use-toast';
import type { PaymentData } from '@/types/PaymentData';

interface FiscalNoteFormData {
  noteNumber: string;
  date: string;
  customerData: any;
  products: any[];
  totalValue: number;
  paymentData: PaymentData;
  sellerId?: string;
  sellerName?: string;
  status: 'draft' | 'issued' | 'printed' | 'canceled';
}

const FiscalNoteForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData>({
    method: 'cash',
    total: 0,
    installments: 1
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<FiscalNoteFormData>();

  const onSubmit = async (data: FiscalNoteFormData) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const noteData = {
        ...data,
        owner_id: user.id,
        payment_data: paymentData,
        status: 'draft'
      };

      await createFiscalNote(noteData);
      
      toast({
        title: "Sucesso",
        description: "Nota fiscal criada com sucesso!",
        variant: "success"
      });
    } catch (error) {
      console.error('Erro ao criar nota fiscal:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar nota fiscal. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Nova Nota Fiscal</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="noteNumber">Número da Nota</Label>
                <Input
                  id="noteNumber"
                  {...register('noteNumber', { required: 'Número da nota é obrigatório' })}
                />
                {errors.noteNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.noteNumber.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  {...register('date', { required: 'Data é obrigatória' })}
                />
                {errors.date && (
                  <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="totalValue">Valor Total</Label>
              <Input
                id="totalValue"
                type="number"
                step="0.01"
                {...register('totalValue', { 
                  required: 'Valor total é obrigatório',
                  min: { value: 0.01, message: 'Valor deve ser maior que zero' }
                })}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  setValue('totalValue', value);
                  setPaymentData(prev => ({ ...prev, total: value }));
                }}
              />
              {errors.totalValue && (
                <p className="text-red-500 text-sm mt-1">{errors.totalValue.message}</p>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Dados de Pagamento</h3>
              
              <div>
                <Label htmlFor="paymentMethod">Método de Pagamento</Label>
                <Select
                  value={paymentData.method}
                  onValueChange={(value: 'cash' | 'credit' | 'debit' | 'pix' | 'check' | 'transfer' | 'other') => {
                    setPaymentData(prev => ({ ...prev, method: value }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Dinheiro</SelectItem>
                    <SelectItem value="credit">Cartão de Crédito</SelectItem>
                    <SelectItem value="debit">Cartão de Débito</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="check">Cheque</SelectItem>
                    <SelectItem value="transfer">Transferência</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(paymentData.method === 'credit') && (
                <div>
                  <Label htmlFor="installments">Parcelas</Label>
                  <Input
                    id="installments"
                    type="number"
                    min="1"
                    max="12"
                    value={paymentData.installments || 1}
                    onChange={(e) => {
                      const installments = parseInt(e.target.value) || 1;
                      setPaymentData(prev => ({ ...prev, installments }));
                    }}
                  />
                </div>
              )}
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Criando...' : 'Criar Nota Fiscal'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FiscalNoteForm;
