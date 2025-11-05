package com.example.gestor_inversores.service.ia;

import com.google.genai.Client;
import com.google.genai.types.*;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class GeminiService implements IGeminiService {

    private static final String DEFAULT_MODEL = "gemini-2.0-flash";
    private static final float DEFAULT_TEMPERATURE = 0.0F;

    private final Client client;
    private final String supportDocumentation;

    public GeminiService(Client client) {
        this.client = client;
        this.supportDocumentation = loadDocumentation();
    }

    public String askGemini(String prompt) {

        GenerateContentConfig config = GenerateContentConfig.builder()
                .temperature(DEFAULT_TEMPERATURE)
                .build();

        GenerateContentResponse response =
                client.models.generateContent(
                        DEFAULT_MODEL,
                        prompt,
                        config
                );

        return response.text();
    }


    public String askSupportBot(String userQuery) {
        String systemInstructionText = buildSupportSystemInstruction(this.supportDocumentation);


        Content systemInstructionContent = Content.builder()
                .role("model")
                .parts(List.of(Part.fromText(systemInstructionText)))
                .build();

        Content userContent = Content.builder()
                .role("user")
                .parts(List.of(Part.fromText(userQuery)))
                .build();

        List<Content> contents = List.of(systemInstructionContent, userContent);

        GenerateContentConfig config = GenerateContentConfig.builder()
                .temperature(DEFAULT_TEMPERATURE)
                .build();

        GenerateContentResponse response =
                client.models.generateContent(
                        DEFAULT_MODEL,
                        contents,
                        config
                );

        return response.text();
    }

    private String buildSupportSystemInstruction(String documentation) {
        return String.format("""
        ERES **PROY+ BOT**, UN ASISTENTE DE SOPORTE AMABLE, CONCISO Y ALTAMENTE RESTRINGIDO.
        Tu única fuente de conocimiento es la DOCUMENTACIÓN DE SOPORTE que se te proporciona, la cual contiene información destinada al público (Estudiantes e Inversores).

        **Instrucciones de Formato (Alta Prioridad):**
        1. **NUNCA** respondas usando tablas (formato `| Campo | Requisito |`).
        2. Siempre usa listas con viñetas (`*` o `1.`) y **negritas** para estructurar la información, especialmente cuando enumeres requisitos o pasos.
        3. Usa un salto de línea entre cada punto o sección para una lectura fácil.

        **Instrucciones de Seguridad y Restricción (Máxima Prioridad):**
        1. Responde ÚNICA Y EXCLUSIVAMENTE con la información provista en la sección DOCUMENTACIÓN DE SOPORTE.
        2. NUNCA reveles detalles de programación, nombres de clases o variables internas (como nombres de DTO, de validadores de código), ni información de procesos de desarrollo (Scrum, costos internos del equipo).
        3. Si la pregunta del usuario es sobre la **lógica interna o técnica** de la aplicación, **no respondas**.

        **Regla de Falla (Obligatoria):**
        Si la información solicitada **no se encuentra** en la DOCUMENTACIÓN DE SOPORTE, o no estás completamente seguro de la respuesta:
        - Responde amablemente uno de los siguientes mensajes (elige el más adecuado según el contexto):
          * **"No tengo esa información en mi documentación. Por favor, comuníquese con soporte."**
          * **"No es posible responder esa consulta. Le recomiendo contactar al equipo de soporte para más ayuda."**
        - No intentes inferir, adivinar o completar información ausente.

        [INICIO DE DOCUMENTACIÓN DE SOPORTE PÚBLICO DE PROY+]
        %s
        [FIN DE DOCUMENTACIÓN DE SOPORTE PÚBLICO DE PROY+]
        """, documentation);
    }

    private String loadDocumentation() {
        return """
            # 📘 Documentación de Soporte para ProyPlus
            Plataforma de inversión y proyectos colaborativos entre estudiantes e inversores.

            ---

            ## 🧭 1. ¿Qué es ProyPlus?
            ProyPlus es una plataforma innovadora que conecta a **estudiantes universitarios** con ideas y proyectos brillantes con una **red de inversores** dispuestos a financiar ese talento.

            ### 🎯 Misión
            - **Para Estudiantes:** Ofrecer una vía real de financiación para llevar sus proyectos al siguiente nivel y ganar experiencia práctica en el mundo de los negocios.
            - **Para Inversores:** Brindar la oportunidad de descubrir y apoyar a la próxima generación de profesionales, invirtiendo en proyectos prometedores y obteniendo retorno por su apoyo.

            La plataforma gestiona **todo el ciclo de vida** de la relación entre estudiante e inversor:
            > Desde la presentación del proyecto hasta la devolución de ganancias, garantizando un proceso transparente, controlado y verificable.

            ---

            ## 👩‍🎓 2. Para Estudiantes: El Camino del Creador

            ### 2.1 Registro y Creación de Proyectos
            1. Regístrate con el rol de **"Estudiante"**.
            2. Al crear un proyecto, completa los siguientes campos:
               - **Título**
               - **Descripción**
               - **Meta de financiación (USD)**
               - **Fechas estimadas**
            3. Al guardar, la **IA** analiza la descripción y asigna automáticamente una **categoría (Tag)** como `"TECNOLOGÍA"` o `"SALUD"`, para ayudar a los inversores a encontrarte fácilmente.

            ---

            ### 2.2 Negociación y Firma de Contratos (Flujo Detallado)
            Cuando un inversor se interesa por tu proyecto, se inicia una **negociación contractual** en dos etapas:

            #### 📝 Etapa 1: Recepción del Borrador
            - Recibirás una notificación con un **Contrato en estado DRAFT (Borrador)**.
            - Ambas partes pueden editar y proponer cambios: monto, rentabilidad, cláusulas, etc.

            #### 🔐 Etapa 2: Primera Firma (Bloqueo)
            - Cuando una de las partes (tú o el inversor) acepta los términos, realiza la **primera firma**.
            - Acciones automáticas:
              - El contrato se bloquea y cambia a **PARTIALLY_SIGNED**.
              - No se pueden hacer más cambios.
              - Se registra la firma de la primera persona.
              - La otra parte recibe una notificación para firmar.

            #### ✅ Etapa 3: Segunda Firma (Confirmación)
            - La otra parte revisa y realiza su **segunda firma definitiva**.
            - Cuando ambas partes han firmado:
              - El contrato pasa a **SIGNED**.
              - Se crea automáticamente la **Inversión asociada**.
              - Se notifica al inversor que debe enviar los fondos.

            ---

            ### 2.3 Confirmación de Inversiones y Finalización del Proyecto
            - Una vez firmados los contratos:
              - Se confirma la **recepción de fondos**.
              - Se actualiza el progreso financiero del proyecto.
              - Al cerrar todos los contratos, el proyecto puede marcarse como **COMPLETED**.

            ---

            ## 💼 3. Para Inversores: El Camino del Impulsor

            ### 3.1 Registro y Exploración
            - Regístrate como **"Inversor"**.
            - Accede al **catálogo de proyectos** disponibles para inversión.

            ---

            ### 3.2 Análisis de Riesgo con IA
            Antes de invertir, utiliza la **Herramienta de Análisis de Riesgo**:
            - Introduce un monto de inversión.
            - La IA evalúa el proyecto y asigna un riesgo: **Bajo**, **Medio** o **Alto**.
            - Un solo factor muy negativo (por ejemplo, bajo progreso) puede elevar el riesgo a **Alto**.

            ---

            ### 3.3 Creación y Negociación de Contratos
            1. **Creación:** El inversor inicia un contrato en **estado DRAFT**.
            2. **Negociación:** Ambas partes pueden editar los términos hasta llegar a un acuerdo.
            3. **Primera Firma (Bloqueo):**
               - El inversor firma primero.
               - El contrato pasa a **PARTIALLY_SIGNED**.
               - Queda bloqueado para edición.
               - Se notifica al estudiante.
            4. **Firma Final:** Cuando el estudiante realiza su firma, el contrato pasa a **SIGNED**.
               - El sistema genera automáticamente la inversión y el inversor debe enviar los fondos.

            ---

            ## 🔄 4. Ciclo de Vida de un Contrato e Inversión

            ### Etapa 1: Negociación y Firma
            1. Inversor crea un contrato → **DRAFT**
            2. Ambas partes negocian → **DRAFT**
            3. Primera firma → **PARTIALLY_SIGNED**
            4. Segunda firma → **SIGNED**
            5. Se crea la inversión → **IN_PROGRESS**

            ### Etapa 2: Financiación
            6. Inversor envía dinero (fuera de la app) y confirma → **PENDING_CONFIRMATION**
            7. Estudiante confirma recepción → **RECEIVED**
            8. Si no lo recibe → **NOT_RECEIVED** (el contrato se cancela automáticamente)

            ---

            ## 💰 5. Flujo de Ganancias (Earnings)

            1. El flujo inicia cuando un **contrato SIGNED** se marca como **CLOSED**.
            2. El sistema calcula automáticamente la ganancia y crea una **Earning (IN_PROGRESS)**.
            3. El inversor recibe una **notificación** con el detalle de la ganancia.
            4. El estudiante envía el pago al inversor (fuera de la app) y confirma → **PENDING_CONFIRMATION**.
            5. El inversor confirma recepción → **PAID**.
            > 🔁 Fin del ciclo de ganancia.

            ---

            ## 💸 6. Flujo de Devoluciones (Cancelación o Financiación Fallida)

            Si un proyecto se **cancela** o **no alcanza su meta**, se debe devolver el dinero:

            1. **Estudiante Inicia la Devolución**
               - Enviar dinero fuera de la app.
               - Pulsar **"Iniciar Devolución"** → cambia a **PENDING_RETURN**.
            2. **Inversor Confirma la Devolución**
               - Verifica el pago recibido y pulsa **"Confirmar Devolución Recibida"**.
            3. **Cierre Automático**
               - Inversión → **RETURNED**
               - Se descuenta el monto del `currentGoal` del proyecto.
               - Se notifica al estudiante.

            ---

            ## 🛠️ 7. Rol del Administrador

            - El **Administrador** puede revertir estados en casos de error humano.
            - Ejemplo: revertir una inversión de **RECEIVED → PENDING_CONFIRMATION**.
            - El sistema ajusta automáticamente los montos del proyecto para mantener la coherencia de datos.
            - Toda acción de reversión es segura y deja trazabilidad.

            ---

            📎 *Fin de la documentación ProyPlus v2.*
            """;
    }
}
