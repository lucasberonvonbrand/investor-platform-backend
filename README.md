# 🤖 Plataforma de Inversores - Backend

**ProyPlus** es una plataforma backend robusta diseñada para conectar a **estudiantes universitarios** con ideas innovadoras y a **inversores** que buscan potenciar el talento emergente. El sistema gestiona todo el ciclo de vida de un proyecto, desde su creación y financiación hasta la liquidación de ganancias, incorporando funcionalidades avanzadas de **Inteligencia Artificial** para el análisis de riesgos, la categorización de proyectos y el soporte al usuario.

## 🚀 Componentes Principales

- 🟢 **API RESTful (gestor-inversores)**: Núcleo de la aplicación que expone endpoints para la gestión completa de proyectos, usuarios, contratos, inversiones y ganancias.
- 🟢 **Módulo de Seguridad (Spring Security)**: Implementa un sistema de autenticación y autorización basado en **JWT (JSON Web Tokens)** y roles (`ADMIN`, `STUDENT`, `INVESTOR`), protegiendo los endpoints según los permisos de cada usuario.
- 🟢 **Servicios de IA (ia-services)**:
    - **Análisis de Riesgo**: Utiliza un modelo de **Machine Learning (Weka)** para evaluar la viabilidad y el riesgo de una inversión.
    - **Etiquetado Automático y Chatbot**: Se integra con **Google Gemini** para categorizar proyectos de forma inteligente y ofrecer un chatbot de soporte conversacional.

## 🧱 Arquitectura y Tecnologías

- ✅ **Framework**: Spring Boot 3 (Java 17)
- ✅ **Base de Datos**: MySQL
- ✅ **Seguridad**: Spring Security, JWT
- ✅ **Machine Learning**: Weka (RandomForest)
- ✅ **IA Generativa**: Google Gemini
- ✅ **Gestión de Dependencias**: Maven
- ✅ **Documentación de API**: Postman

## ✨ Funcionalidades Destacadas con IA

### 1. Análisis de Riesgo de Inversión (Weka)

Antes de comprometer fondos, un inversor puede solicitar un análisis de riesgo para una propuesta de contrato. El sistema utiliza un modelo de **Random Forest** entrenado con datos históricos para predecir el nivel de riesgo (`BAJO`, `MEDIO`, `ALTO`).

#### ¿Cómo funciona?

1.  **Entrada de Datos**: El inversor proporciona el monto, la moneda y los porcentajes de rentabilidad que desea proponer.
2.  **Cálculo de Métricas Clave**: El servicio `RiskPredictionService` calcula en tiempo real un conjunto de características (features) para alimentar el modelo:
    - **Progreso del Proyecto**: Porcentaje de la meta de financiación ya alcanzado.
    - **Impacto de la Inversión**: Qué porcentaje de la meta total (o de lo que falta por financiar) representa la inversión propuesta.
    - **Ratio de Rentabilidad**: Compara la rentabilidad ofrecida con un promedio del mercado (8% anual).
    - **Ritmo de Financiación (Funding Pace)**: Mide si el proyecto está recaudando fondos más rápido o más lento de lo esperado en función del tiempo transcurrido.
3.  **Predicción del Modelo**: Estas métricas se introducen en el modelo de Weka, que devuelve una categoría de riesgo y un **puntaje de confianza**.
4.  **Informe Detallado**: Se genera un informe completo que incluye:
    - La categoría de riesgo y su confianza.
    - Un desglose de los **factores de análisis**, explicando cuáles son positivos o negativos y su **importancia relativa** en la predicción.
    - **Proyecciones de ganancias** a 1, 2 y 3 años.
    - Gráficos para visualizar la composición del riesgo.

### 2. Etiquetado Automático de Proyectos (Google Gemini)

Cuando un estudiante crea un proyecto, la descripción proporcionada es analizada por la IA para asignarle automáticamente una categoría.

#### ¿Cómo funciona?

1.  **Prompt Engineering**: El servicio `ProjectService` construye un *prompt* específico que instruye a Google Gemini para que actúe como un clasificador experto.
2.  **Contexto y Reglas**: El prompt contiene una lista cerrada de categorías (ej. `TECNOLOGÍA`, `SALUD Y BIENESTAR`, `IMPACTO SOCIAL`) y reglas estrictas para que la IA responda **únicamente** con una de las etiquetas de la lista.
3.  **Inferencia del Modelo**: Se envía la descripción del proyecto a Gemini, que devuelve la etiqueta más apropiada.
4.  **Asignación**: La etiqueta es asignada al proyecto, mejorando su visibilidad y capacidad de ser descubierto por inversores interesados en áreas específicas.

### 3. Chatbot de Soporte (Google Gemini)

La plataforma incluye un chatbot, **Proy+ Bot**, que responde a las preguntas frecuentes de los usuarios.

#### ¿Cómo funciona?

1.  **Base de Conocimiento**: El servicio `GeminiService` carga una base de conocimiento interna que contiene información detallada sobre el funcionamiento de la plataforma, los flujos de negocio y las políticas.
2.  **Instrucción de Sistema (System Instruction)**: Se crea un prompt de sistema que define la "personalidad" y las reglas del chatbot:
    - Debe presentarse como **Proy+ Bot**.
    - Debe responder basándose **exclusivamente** en la base de conocimiento proporcionada.
    - Tiene prohibido revelar que es un modelo de IA o que sigue instrucciones.
    - Si no conoce la respuesta, debe indicarlo de forma amable y profesional.
3.  **Interacción**: Cuando un usuario envía una consulta, esta se combina con la instrucción de sistema y se envía a Gemini, que genera una respuesta coherente y contextualizada.

## 🔄 Flujos de Negocio Detallados

### 1. Flujo de Creación y Financiación de un Proyecto

1.  **Creación (Estudiante)**: Un estudiante registra un proyecto, proporcionando detalles como nombre, descripción, meta de financiación y fechas. La IA le asigna una etiqueta. El proyecto inicia en estado `PENDING_FUNDING`.
2.  **Propuesta de Contrato (Inversor)**: Un inversor interesado crea un contrato (`DRAFT`), especificando monto, moneda y rentabilidades.
3.  **Negociación**: Ambas partes pueden editar el contrato mientras esté en `DRAFT`.
4.  **Acuerdo y Firma**:
    - Una de las partes firma, el contrato pasa a `PARTIALLY_SIGNED` y se bloquea.
    - La otra parte firma, el contrato cambia a `SIGNED`.
5.  **Creación de la Inversión**: Al firmarse el contrato, se crea automáticamente una **inversión** asociada en estado `IN_PROGRESS`, y se notifica al inversor para que realice la transferencia.
6.  **Transferencia y Confirmación**:
    - El inversor envía los fondos (fuera de la plataforma) y lo notifica en el sistema (`PENDING_CONFIRMATION`).
    - El estudiante verifica la recepción y confirma en la plataforma (`RECEIVED`). El `currentGoal` del proyecto se actualiza.
7.  **Cierre del Ciclo de Financiación**:
    - Si el proyecto alcanza su `budgetGoal`, pasa a `IN_PROGRESS`.
    - Si el tiempo de financiación expira sin alcanzar la meta, pasa a `NOT_FUNDED`, y se debe iniciar la devolución de los fondos.

### 2. Flujo de Cierre de Contrato y Generación de Ganancias

1.  **Cierre del Contrato (Estudiante)**: Una vez que el proyecto ha finalizado y la inversión ha cumplido su ciclo, el estudiante cierra el contrato (`CLOSED`).
2.  **Cálculo y Creación de Ganancia**: Al cerrar el contrato, el sistema calcula automáticamente la ganancia (`Earning`) para el inversor, basándose en el tiempo transcurrido y las tasas de rentabilidad pactadas. La ganancia se crea en estado `IN_PROGRESS`.
3.  **Pago de Ganancia (Estudiante)**: El estudiante transfiere la ganancia al inversor y lo notifica en la plataforma (`PENDING_CONFIRMATION`).
4.  **Confirmación de Ganancia (Inversor)**: El inversor confirma la recepción de los fondos, y la ganancia pasa a `RECEIVED`, completando el ciclo.

### 3. Flujo de Cancelación y Devolución

- **Cancelación de Contrato**:
    - Un contrato en `DRAFT` o `PARTIALLY_SIGNED` puede ser cancelado por cualquiera de las partes.
    - Un contrato `SIGNED` puede ser cancelado por el estudiante, lo que también cancela la inversión asociada.
- **Cancelación de Proyecto**:
    - Si un estudiante cancela un proyecto en `IN_PROGRESS`, se notifica a los inversores para iniciar la devolución de fondos.
- **Proceso de Devolución (`PENDING_REFUND`)**:
    - El estudiante inicia el proceso de devolución para los contratos de proyectos cancelados o no financiados.
    - Notifica el envío de la devolución (`PENDING_CONFIRMATION`).
    - El inversor confirma la recepción (`REFUNDED`).

## ⚙️ Cómo Ejecutar el Proyecto

### Requisitos

- Java 17
- Maven 3.9+
- MySQL
- Postman (opcional)

### Paso a Paso

1️⃣ **Clonar el repositorio**:

```bash
git clone <URL-DEL-REPOSITORIO>
cd investor-platform-backend
```

2️⃣ **Configurar la base de datos MySQL**:

```sql
CREATE DATABASE IF NOT EXISTS `investor-platform`;
```

Use el siguiente comando para importar los datos iniciales:
```bash
mysql -u <tu_usuario> -p investor-platform < ./db/investor-platform-backend-dump.sql
```

3️⃣ **Configurar variables de entorno**:
Deberás configurar las credenciales de la base de datos y las claves de API (como la de Google Gemini) en el archivo `src/main/resources/application.properties`.

4️⃣ **Levantar la aplicación**:

```bash
cd backend
mvn spring-boot:run
```

La aplicación estará disponible en `http://localhost:8080`.

## 🔐 Endpoints

(La lista de endpoints se mantiene igual que en la versión anterior, ya que es exhaustiva).

## 📬 Colección Postman

- **Archivo**: `postman/investor-platform-backend.postman_collection`
- **Instrucciones**: Abrir Postman → Importar archivo → Ejecutar requests.

## 🗄️ Base de Datos MySQL

- **Archivo**: `db/investor-platform-backend-dump.sql`
- **Instrucciones**: Usar este archivo para crear y poblar la base de datos `investor-platform` antes de ejecutar la aplicación.

## 📁 Estructura del Proyecto

```
investor-platform-backend/
├── backend/
│   ├── .gitattributes
│   ├── .gitignore
│   ├── mvnw
│   ├── mvnw.cmd
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/
│       │   │   └── com/
│       │   │       └── example/
│       │   │           └── gestor_inversores/
│       │   │               ├── GestorInversoresApplication.java
│       │   │               ├── config/
│       │   │               │   ├── AppConfig.java
│       │   │               │   └── GeminiConfiguration.java
│       │   │               ├── controller/
│       │   │               │   ├── AdminController.java
│       │   │               │   ├── AuthenticationController.java
│       │   │               │   ├── ChatBotController.java
│       │   │               │   ├── ContractController.java
│       │   │               │   ├── ControllerHandler.java
│       │   │               │   ├── CurrencyController.java
│       │   │               │   ├── EarningController.java
│       │   │               │   ├── InvestmentController.java
│       │   │               │   ├── InvestorController.java
│       │   │               │   ├── PasswordResetController.java
│       │   │               │   ├── PermissionController.java
│       │   │               │   ├── ProjectController.java
│       │   │               │   ├── ProjectDocumentController.java
│       │   │               │   ├── RiskAnalysisController.java
│       │   │               │   ├── RoleController.java
│       │   │               │   ├── StudentController.java
│       │   │               │   └── UserController.java
│       │   │               ├── dto/
│       │   │               │   ├── AddressDTO.java
│       │   │               │   ├── AuthLoginRequestDTO.java
│       │   │               │   ├── AuthLoginResponseDTO.java
│       │   │               │   ├── ContactOwnerDTO.java
│       │   │               │   ├── ContractActionDTO.java
│       │   │               │   ├── CurrencyConversionDTO.java
│       │   │               │   ├── EarningsSummaryDTO.java
│       │   │               │   ├── PasswordResetRequestDTO.java
│       │   │               │   ├── PasswordResetRequestEmailDTO.java
│       │   │               │   ├── PasswordResetResponseDTO.java
│       │   │               │   ├── ProjectDTO.java
│       │   │               │   ├── RequestAdminContractUpdateDTO.java
│       │   │               │   ├── RequestAdminInvestmentUpdateDTO.java
│       │   │               │   ├── RequestAdminProjectUpdateDTO.java
│       │   │               │   ├── RequestAdminUpdateEarningStatusDTO.java
│       │   │               │   ├── RequestContractActionByInvestorDTO.java
│       │   │               │   ├── RequestContractActionByStudentDTO.java
│       │   │               │   ├── RequestContractDTO.java
│       │   │               │   ├── RequestContractUpdateByInvestorDTO.java
│       │   │               │   ├── RequestContractUpdateByStudentDTO.java
│       │   │               │   ├── RequestEarningActionByStudentDTO.java
│       │   │               │   ├── RequestEarningActionDTO.java
│       │   │               │   ├── RequestInvestmentActionByInvestorDTO.java
│       │   │               │   ├── RequestInvestorDTO.java
│       │   │               │   ├── RequestInvestorUpdateByAdminDTO.java
│       │   │               │   ├── RequestInvestorUpdateDTO.java
│       │   │               │   ├── RequestProjectCurrentGoalUpdateDTO.java
│       │   │               │   ├── RequestProjectDTO.java
│       │   │               │   ├── RequestProjectDocumentDTO.java
│       │   │               │   ├── RequestProjectUpdateDTO.java
│       │   │               │   ├── RequestRiskPredictionDTO.java
│       │   │               │   ├── RequestStudentByUsernameDTO.java
│       │   │               │   ├── RequestStudentDTO.java
│       │   │               │   ├── RequestStudentUpdateByAdminDTO.java
│       │   │               │   ├── RequestStudentUpdateDTO.java
│       │   │               │   ├── RequestUserDTO.java
│       │   │               │   ├── RequestUserUpdateDTO.java
│       │   │               │   ├── ResponseContractDTO.java
│       │   │               │   ├── ResponseEarningDTO.java
│       │   │               │   ├── ResponseFile.java
│       │   │               │   ├── ResponseInvestmentDTO.java
│       │   │               │   ├── ResponseInvestorDTO.java
│       │   │               │   ├── ResponseProjectByStudentDTO.java
│       │   │               │   ├── ResponseProjectDTO.java
│       │   │               │   ├── ResponseProjectDocumentDTO.java
│       │   │               │   ├── ResponseProjectStudentDTO.java
│       │   │               │   ├── ResponseRiskAnalysisDTO.java
│       │   │               │   ├── ResponseRiskPredictionDTO.java
│       │   │               │   ├── ResponseStudentDTO.java
│       │   │               │   ├── ResponseStudentNameDTO.java
│       │   │               │   ├── ResponseUserDTO.java
│       │   │               │   └── RoleDTO.java
│       │   │               ├── exception/
│       │   │               │   ├── ApiError.java
│       │   │               │   ├── BusinessException.java
│       │   │               │   ├── ContractAlreadySignedException.java
│       │   │               │   ├── ContractCannotBeModifiedException.java
│       │   │               │   ├── ContractNotFoundException.java
│       │   │               │   ├── CreateException.java
│       │   │               │   ├── CuitAlreadyExistsException.java
│       │   │               │   ├── CurrencyConversionException.java
│       │   │               │   ├── DeleteException.java
│       │   │               │   ├── DniAlreadyExistsException.java
│       │   │               │   ├── DocumentFileException.java
│       │   │               │   ├── DocumentFileNotFoundException.java
│       │   │               │   ├── EarningNotFoundException.java
│       │   │               │   ├── EmailAlreadyExistsException.java
│       │   │               │   ├── EmailNotFoundException.java
│       │   │               │   ├── EmailSendException.java
│       │   │               │   ├── ExistingProjectException.java
│       │   │               │   ├── ExpiredTokenException.java
│       │   │               │   ├── InternalServerErrorException.java
│       │   │               │   ├── InvalidContractOperationException.java
│       │   │               │   ├── InvalidPasswordException.java
│       │   │               │   ├── InvalidProjectException.java
│       │   │               │   ├── InvalidTokenException.java
│       │   │               │   ├── InvestmentNotFoundException.java
│       │   │               │   ├── InvestorDesactivationException.java
│       │   │               │   ├── InvestorNotFoundException.java
│       │   │               │   ├── OwnerNotFoundException.java
│       │   │               │   ├── PermissionAlreadyExistsException.java
│       │   │               │   ├── PermissionNotFoundException.java
│       │   │               │   ├── ProjectNotFoundException.java
│       │   │               │   ├── ProjectTagException.java
│       │   │               │   ├── RoleAlreadyExistsException.java
│       │   │               │   ├── RoleNotFoundException.java
│       │   │               │   ├── StudentDesactivationException.java
│       │   │               │   ├── StudentNotFoundException.java
│       │   │               │   ├── UnauthorizedOperationException.java
│       │   │               │   ├── UpdateException.java
│       │   │               │   ├── UserNotFoundException.java
│       │   │               │   ├── UsernameAlreadyExistsException.java
│       │   │               │   └── ValidationExceptionHandler.java
│       │   │               ├── mapper/
│       │   │               │   ├── AddressMapper.java
│       │   │               │   ├── AdminMapper.java
│       │   │               │   ├── ContractActionMapper.java
│       │   │               │   ├── ContractMapper.java
│       │   │               │   ├── EarningMapper.java
│       │   │               │   ├── InvestmentMapper.java
│       │   │               │   ├── InvestorMapper.java
│       │   │               │   ├── ProjectMapper.java
│       │   │               │   ├── ProjectStudentMapper.java
│       │   │               │   ├── StudentMapper.java
│       │   │               │   └── UserMapper.java
│       │   │               ├── model/
│       │   │               │   ├── Address.java
│       │   │               │   ├── Contract.java
│       │   │               │   ├── ContractAction.java
│       │   │               │   ├── Earning.java
│       │   │               │   ├── Investment.java
│       │   │               │   ├── Investor.java
│       │   │               │   ├── PasswordResetToken.java
│       │   │               │   ├── Permission.java
│       │   │               │   ├── Project.java
│       │   │               │   ├── ProjectDocument.java
│       │   │               │   ├── ProjectTag.java
│       │   │               │   ├── Role.java
│       │   │               │   ├── Student.java
│       │   │               │   ├── User.java
│       │   │               │   └── enums/
│       │   │               │       ├── ContractStatus.java
│       │   │               │       ├── Currency.java
│       │   │               │       ├── DegreeStatus.java
│       │   │               │       ├── EarningStatus.java
│       │   │               │       ├── InvestmentStatus.java
│       │   │               │       ├── ProjectStatus.java
│       │   │               │       ├── Province.java
│       │   │               │       ├── RiskLevel.java
│       │   │               │       └── University.java
│       │   │               ├── repository/
│       │   │               │   ├── IContractRepository.java
│       │   │               │   ├── IEarningRepository.java
│       │   │               │   ├── IInvestmentRepository.java
│       │   │               │   ├── IInvestorRepository.java
│       │   │               │   ├── IPasswordResetTokenRepository.java
│       │   │               │   ├── IPermissionRepository.java
│       │   │               │   ├── IProjectDocumentRepository.java
│       │   │               │   ├── IProjectRepository.java
│       │   │               │   ├── IProjectTagRepository.java
│       │   │               │   ├── IRoleRepository.java
│       │   │               │   ├── IStudentRepository.java
│       │   │               │   └── IUserRepository.java
│       │   │               ├── security/
│       │   │               │   └── config/
│       │   │               │       ├── SecurityConfig.java
│       │   │               │       └── filter/
│       │   │               │           └── JwtTokenValidator.java
│       │   │               ├── service/
│       │   │               │   ├── admin/
│       │   │               │   │   ├── AdminService.java
│       │   │               │   │   └── IAdminService.java
│       │   │               │   ├── analysis/
│       │   │               │   │   ├── IRiskPredictionService.java
│       │   │               │   │   └── RiskPredictionService.java
│       │   │               │   ├── auth/
│       │   │               │   │   ├── IPasswordResetService.java
│       │   │               │   │   ├── PasswordResetService.java
│       │   │               │   │   └── UserDetailsServiceImp.java
│       │   │               │   ├── contract/
│       │   │               │   │   ├── ContractService.java
│       │   │               │   │   └── IContractService.java
│       │   │               │   ├── currency/
│       │   │               │   │   └── CurrencyConversionService.java
│       │   │               │   ├── earning/
│       │   │               │   │   ├── EarningService.java
│       │   │               │   │   └── IEarningService.java
│       │   │               │   ├── ia/
│       │   │               │   │   ├── GeminiService.java
│       │   │               │   │   └── IGeminiService.java
│       │   │               │   ├── investment/
│       │   │               │   │   ├── IInvestmentService.java
│       │   │               │   │   └── InvestmentService.java
│       │   │               │   ├── investor/
│       │   │               │   │   ├── IInvestorService.java
│       │   │               │   │   └── InvestorService.java
│       │   │               │   ├── mail/
│       │   │               │   │   ├── IMailService.java
│       │   │               │   │   └── MailService.java
│       │   │               │   ├── permission/
│       │   │               │   │   ├── IPermissionService.java
│       │   │               │   │   └── PermissionService.java
│       │   │               │   ├── project/
│       │   │               │   │   ├── IProjectService.java
│       │   │               │   │   └── ProjectService.java
│       │   │               │   ├── projectDocument/
│       │   │               │   │   ├── IProjectDocumentService.java
│       │   │               │   │   └── ProjectDocumentService.java
│       │   │               │   ├── projectTag/
│       │   │               │   │   ├── IProjectTagService.java
│       │   │               │   │   └── ProjectTagService.java
│       │   │               │   ├── role/
│       │   │               │   │   ├── IRoleService.java
│       │   │               │   │   └── RoleService.java
│       │   │               │   ├── scheduler/
│       │   │               │   │   └── ProjectFundingScheduler.java
│       │   │               │   ├── student/
│       │   │               │   │   ├── IStudentService.java
│       │   │               │   │   └── StudentService.java
│       │   │               │   └── user/
│       │   │               │       ├── IUserService.java
│       │   │               │       └── UserService.java
│       │   │               └── utils/
│       │   │                   └── JwtUtils.java
│       │   └── resources/
│       │       ├── application.properties
│       │       └── risk_dataset.csv
│       └── test/
├── db/
│   └── investor-platform-backend-dump.sql
├── postman/
│   └── investor-platform-backend.postman_collection
└── README.md
```
