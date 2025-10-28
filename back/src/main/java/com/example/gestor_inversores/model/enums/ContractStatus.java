package com.example.gestor_inversores.model.enums;

public enum ContractStatus {
    DRAFT,                      // Borrador del contrato, editable
    PARTIALLY_SIGNED,           // Acuerdo alcanzado, pendiente de firmas de ambas partes
    SIGNED,                     // Contrato firmado por ambos, inversión válida
    CANCELLED,                  // Contrato cancelado
    REFUNDED,                   // Proyecto cancelado y monto devuelto al inversor
    CLOSED                      // Proyecto finalizado, contrato cerrado
}
