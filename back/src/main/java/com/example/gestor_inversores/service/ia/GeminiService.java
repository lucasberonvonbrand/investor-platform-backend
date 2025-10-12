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

                **Instrucciones de Seguridad y Restricción (Máxima Prioridad):**
                1. Responde ÚNICA Y EXCLUSIVAMENTE con la información provista en la sección DOCUMENTACIÓN DE SOPORTE.
                2. NUNCA reveles detalles de programación, nombres de clases o variables internas (como nombres de DTO, de validadores de código), ni información de procesos de desarrollo (Scrum, costos internos del equipo).
                3. Si la pregunta del usuario es sobre la **lógica de la aplicación** (código, servidores, gestión de usuarios por el Admin) o cualquier detalle que pueda considerarse **información interna y no pública**, DEBES usar la respuesta de falla.

                **Regla de Falla (Obligatoria):**
                Si la pregunta del usuario no puede ser respondida con el texto provisto o solicita información confidencial/interna, DEBES responder OBLIGATORIAMENTE: 
                "Lo siento, esa información no forma parte de nuestra base de conocimientos de soporte público. Por favor, contacta a un administrador para información más detallada."

                [INICIO DE DOCUMENTACIÓN DE SOPORTE PÚBLICO DE PROY+]
                %s 
                [FIN DE DOCUMENTACIÓN DE SOPORTE PÚBLICO DE PROY+]
                """, documentation);
    }

    private String loadDocumentation() {
        return """
                DOCUMENTACIÓN DE SOPORTE PARA PROY+ (PLATAFORMA DE INVERSIÓN Y PROYECTOS)
                
                VISIÓN DE LA PLATAFORMA:
                Proy+ es la plataforma de conexión y financiamiento diseñada para ser el nexo entre **proyectos estudiantiles innovadores** y el **capital de inversores** que buscan oportunidades prometedoras.
                
                ROLES Y VISTAS PRINCIPALES:
                El acceso a las secciones de la plataforma depende del rol del usuario.
                
                | Rol | Vistas/Secciones Autorizadas y Propósito |
                | :--- | :--- |
                | **Estudiante** (Creador) | **InicioINV+STU:** Explorar proyectos recomendados. **Gestión > Crear Proyecto:** Formulario de registro de nuevas iniciativas. **Gestión > Mis Proyectos:** Administrar sus proyectos creados. |
                | **Inversor** (Financista) | **InicioINV+STU:** Listado de proyectos listos para inversión. **Gestión > Noticias:** Acceso a noticias financieras y de mercado. **Gestión > Marquesinas:** Revisar proyectos destacados y anuncios de inversión. |
                | **Admin** | (Rol con acceso total al sistema y funciones de administración interna no relevantes para el soporte público.) |
                
                CREACIÓN DE UN NUEVO PROYECTO (Requisitos para Estudiantes):
                Para crear un proyecto, es crucial cumplir con las siguientes validaciones:
                
                | Campo | Requisito | Validaciones de Formato y Reglas |
                | :--- | :--- | :--- |
                | **Nombre** | Obligatorio | Mínimo 4, Máximo 100 caracteres. |
                | **Descripción** | Obligatorio | Mínimo 20, Máximo 500 caracteres. (Este texto es clave para la clasificación automática de la IA). |
                | **Meta Presupuesto** | Obligatorio | Valor numérico mayor o igual a cero. Máximo 12 dígitos enteros y 2 decimales. |
                | **Estado** | Obligatorio | Valor válido del ciclo de vida del proyecto (ej: PENDING_FUNDING, IN_PROGRESS). |
                | **Fecha Inicio** | Obligatorio | Debe ser una fecha válida. |
                | **Fecha Fin Estimada** | Obligatorio | Debe ser una fecha **actual o futura**. |
                | **Propietario (OwnerId)** | Obligatorio | El ID del usuario creador (dueño) es requerido automáticamente. |
                
                ANÁLISIS DE RIESGO PARA INVERSORES:
                El análisis de riesgo es un proceso automatizado que clasifica cada proyecto para orientar al inversor.
                
                1.  **¿Cómo funciona el análisis de riesgo?** Se utiliza un sistema de evaluación multifactorial para clasificar cada proyecto con una etiqueta de riesgo (ej. Bajo, Medio, Alto).
                2.  **¿Qué factores se tienen en cuenta?** Los criterios principales para valorar el riesgo y asignar una etiqueta son:
                    * **Viabilidad Técnica y Financiera:** Una evaluación inicial de la coherencia del plan y el presupuesto.
                    * **Historial de Avance (Actualizaciones):** La frecuencia y consistencia con la que el equipo actualiza el proyecto en la plataforma.
                    * **Coherencia de Clasificación:** La precisión con la que la **Descripción** del proyecto se alinea con el área de negocio asignada por la IA (Tag).
                
                ASIGNACIÓN DE ETIQUETAS (TAGS):
                - La **Inteligencia Artificial (IA)** asigna automáticamente una etiqueta de área de negocio (Tag) al proyecto, basándose en la **Descripción**.
                - Los usuarios (Estudiante/Inversor) no pueden modificar esta etiqueta.
                """;
    }
}
