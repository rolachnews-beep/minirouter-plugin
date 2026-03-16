/**
 * MiniRouter v2 — Model-Kategorien mit Tier-System
 *
 * Inspiriert von ClawRouter's 15-dimensionaler gewichteter Scoring.
 * Jede Kategorie hat:
 * - name: Tier-Name (SIMPLE, MEDIUM, COMPLEX, REASONING)
 * - models: Liste der Modelle (erstes = primary, rest = fallback)
 * - keywords: Keywords zur Erkennung (multi-sprachig: EN, DE, ZH, JA, RU, ES, PT, KO, AR)
 * - useCases: Task-Typen die diese Kategorie verwenden soll
 */
export const MODEL_CATEGORIES = [
    // ═══════════════════════════════════════════════
    // TIER: SIMPLE — Schnelle, billige Modelle für einfache Fragen
    // ═══════════════════════════════════════════════
    {
        name: 'SIMPLE',
        models: [
            'meta-llama/llama-3.1-8b-instruct',
            'google/gemma-2-9b-it',
        ],
        keywords: [
            // === English ===
            'what is', 'define', 'translate', 'hello', 'hi', 'hey', 'yes or no',
            'capital of', 'how old', 'who is', 'when was', 'how many', 'how much',
            'tell me', 'name of', 'where is', 'what time', 'what day',
            // === German ===
            'was ist', 'definiere', 'übersetze', 'hallo', 'ja oder nein',
            'hauptstadt', 'wie alt', 'wer ist', 'wann', 'erkläre',
            'wie viel', 'wie viele', 'wo ist', 'welcher', 'welche',
            'nenne mir', 'sag mir', 'wie heißt', 'wie spät',
            // === Chinese ===
            '什么是', '定义', '翻译', '你好', '是否', '首都',
            '多大', '谁是', '何时', '几个', '哪里', '什么时候',
            // === Japanese ===
            'とは', '定義', '翻訳', 'こんにちは', '首都', '誰',
            'いくつ', 'どこ', 'いつ', '何',
            // === Russian ===
            'что такое', 'определение', 'перевести', 'переведи', 'привет',
            'да или нет', 'столица', 'сколько лет', 'кто такой', 'когда',
            'сколько', 'где', 'какой',
            // === Spanish ===
            'qué es', 'definir', 'traducir', 'hola', 'sí o no',
            'capital de', 'cuántos años', 'quién es', 'cuándo', 'dónde',
            // === Portuguese ===
            'o que é', 'definir', 'traduzir', 'olá', 'sim ou não',
            'capital de', 'quantos anos', 'quem é', 'quando', 'onde',
            // === Korean ===
            '무엇', '정의', '번역', '안녕하세요', '예 또는 아니오',
            '수도', '누구', '언제', '몇', '어디',
            // === Arabic ===
            'ما هو', 'تعريف', 'ترجم', 'مرحبا', 'نعم أو لا',
            'عاصمة', 'من هو', 'متى', 'كم', 'أين',
        ],
        useCases: ['simple-qa', 'greeting', 'translation', 'fact-lookup'],
    },
    // ═══════════════════════════════════════════════
    // TIER: MEDIUM — Solide Allrounder für Code und moderate Tasks
    // ═══════════════════════════════════════════════
    {
        name: 'MEDIUM',
        models: [
            'z-ai/glm-5-turbo',
            'google/gemini-2.5-flash',
            'deepseek/deepseek-chat',
        ],
        keywords: [
            // === English ===
            'code', 'function', 'class', 'debug', 'implement', 'program',
            'script', 'api', 'error', 'bug', 'fix', 'refactor',
            'write a', 'create a', 'build a', 'how to',
            'explain', 'tutorial', 'guide', 'setup', 'configure',
            // === German ===
            'code', 'funktion', 'klasse', 'debug', 'implementieren',
            'programm', 'skript', 'fehler', 'bug', 'beheben', 'refaktorieren',
            'schreibe ein', 'erstelle ein', 'baue ein', 'wie kann ich',
            'erkläre', 'anleitung', 'einrichten', 'konfigurieren',
            'programmier', 'code snippet', 'algorithmus', 'variable', 'methode',
            // === Chinese ===
            '代码', '函数', '类', '调试', '实现', '程序',
            '脚本', '接口', '错误', '修复', '重构',
            '写一个', '创建', '构建', '如何',
            '解释', '教程', '指南', '设置', '配置',
            // === Japanese ===
            'コード', '関数', 'クラス', 'デバッグ', '実装', 'プログラム',
            'スクリプト', 'API', 'エラー', 'バグ', '修正', 'リファクタ',
            '書いて', '作成', '構築', '方法',
            '説明', 'チュートリアル', 'セットアップ', '設定',
            // === Russian ===
            'код', 'функция', 'класс', 'отладка', 'реализовать', 'программа',
            'скрипт', 'API', 'ошибка', 'баг', 'исправить', 'рефакторинг',
            'напиши', 'создай', 'построй', 'как',
            'объясни', 'руководство', 'настройка', 'конфигурация',
            // === Spanish ===
            'código', 'función', 'clase', 'depurar', 'implementar',
            'programa', 'script', 'API', 'error', 'arreglar',
            'escribe', 'crea', 'construye', 'cómo',
            'explica', 'tutorial', 'configurar',
            // === Portuguese ===
            'código', 'função', 'classe', 'depurar', 'implementar',
            'programa', 'script', 'API', 'erro', 'corrigir',
            'escreva', 'crie', 'construa', 'como',
            'explique', 'tutorial', 'configurar',
            // === Korean ===
            '코드', '함수', '클래스', '디버그', '구현', '프로그램',
            '스크립트', 'API', '오류', '수정', '리팩토링',
            '작성', '생성', '구축', '방법',
            '설명', '튜토리얼', '설정', '구성',
            // === Arabic ===
            'كود', 'دالة', 'فئة', 'تصحيح', 'تنفيذ', 'برنامج',
            'نص', 'خطأ', 'إصلاح', 'إعادة هيكلة',
            'اكتب', 'أنشئ', 'ابني', 'كيف',
            'اشرح', 'دليل', 'إعداد', 'تكوين',
        ],
        useCases: ['code-generation', 'debugging', 'tutorials', 'explanations', 'how-to'],
    },
    // ═══════════════════════════════════════════════
    // TIER: COMPLEX — Starke Modelle für komplexe Aufgaben
    // ═══════════════════════════════════════════════
    {
        name: 'COMPLEX',
        models: [
            'anthropic/claude-sonnet-4.6',
            'google/gemini-3-pro-preview',
            'openai/gpt-4o',
        ],
        keywords: [
            // === English ===
            'analyze', 'architecture', 'design', 'optimize', 'distributed',
            'microservice', 'database', 'infrastructure', 'kubernetes',
            'algorithm', 'security', 'performance', 'scalable',
            'compare', 'evaluate', 'review', 'audit', 'strategy',
            'multi-step', 'end-to-end', 'full stack', 'system design',
            // === German ===
            'analysiere', 'architektur', 'entwerfen', 'optimieren', 'verteilt',
            'mikroservice', 'datenbank', 'infrastruktur', 'kubernetes',
            'algorithmus', 'sicherheit', 'performance', 'skalierbar',
            'vergleiche', 'bewerte', 'review', 'audit', 'strategie',
            'mehrstufig', 'end-to-end', 'full stack', 'systemdesign',
            // === Chinese ===
            '分析', '架构', '设计', '优化', '分布式',
            '微服务', '数据库', '基础设施', '算法',
            '安全', '性能', '可扩展', '比较', '评估', '审查',
            '多步骤', '端到端', '全栈', '系统设计',
            // === Japanese ===
            '分析', 'アーキテクチャ', '設計', '最適化', '分散',
            'マイクロサービス', 'データベース', 'インフラ', 'アルゴリズム',
            'セキュリティ', 'パフォーマンス', 'スケーラブル',
            '比較', '評価', 'レビュー', '監査', '戦略',
            // === Russian ===
            'анализировать', 'архитектура', 'спроектировать', 'оптимизировать',
            'распределённый', 'микросервис', 'база данных', 'инфраструктура',
            'алгоритм', 'безопасность', 'производительность', 'масштабируемый',
            'сравнить', 'оценить', 'ревью', 'аудит', 'стратегия',
            // === Spanish ===
            'analizar', 'arquitectura', 'diseñar', 'optimizar',
            'distribuido', 'microservicio', 'base de datos', 'infraestructura',
            'algoritmo', 'seguridad', 'rendimiento', 'escalable',
            'comparar', 'evaluar', 'revisión', 'auditoría', 'estrategia',
            // === Portuguese ===
            'analisar', 'arquitetura', 'projetar', 'otimizar',
            'distribuído', 'microsserviço', 'banco de dados', 'infraestrutura',
            'algoritmo', 'segurança', 'desempenho', 'escalável',
            'comparar', 'avaliar', 'revisão', 'auditoria', 'estratégia',
            // === Korean ===
            '분석', '아키텍처', '설계', '최적화', '분산',
            '마이크로서비스', '데이터베이스', '인프라', '알고리즘',
            '보안', '성능', '확장 가능', '비교', '평가', '감사', '전략',
            // === Arabic ===
            'تحليل', 'بنية', 'تصميم', 'تحسين', 'موزع',
            'خدمة مصغرة', 'قاعدة بيانات', 'بنية تحتية',
            'خوارزمية', 'أمان', 'أداء', 'قابل للتوسع',
            'مقارنة', 'تقييم', 'مراجعة', 'تدقيق', 'استراتيجية',
        ],
        useCases: ['analysis', 'architecture', 'system-design', 'optimization', 'review'],
    },
    // ═══════════════════════════════════════════════
    // TIER: REASONING — Dedizierte Reasoning-Modelle für Logik & Mathematik
    // ═══════════════════════════════════════════════
    {
        name: 'REASONING',
        models: [
            'minimax/minimax-m2.5',
            'openai/o4-mini',
            'x-ai/grok-4.1-fast',
        ],
        keywords: [
            // === English ===
            'prove', 'theorem', 'derive', 'step by step', 'chain of thought',
            'formally', 'mathematical', 'proof', 'logically', 'calculate',
            'math', 'equation', 'formula', 'probability', 'statistics',
            'logic puzzle', 'riddle', 'brainteaser', 'deduce', 'infer',
            // === German ===
            'beweisen', 'beweis', 'theorem', 'ableiten', 'schritt für schritt',
            'gedankenkette', 'formal', 'mathematisch', 'logisch', 'berechne',
            'mathe', 'gleichung', 'formel', 'wahrscheinlichkeit', 'statistik',
            'logikrätsel', 'schließen', 'folgern', 'deduzieren',
            // === Chinese ===
            '证明', '定理', '推导', '逐步', '思维链',
            '形式化', '数学', '逻辑', '计算', '方程',
            '公式', '概率', '统计', '谜题', '推理',
            // === Japanese ===
            '証明', '定理', '導出', 'ステップバイステップ',
            '論理的', '数学的', '計算', '方程式',
            '公式', '確率', '統計', '推論',
            // === Russian ===
            'доказать', 'доказательств', 'теорема', 'вывести',
            'шаг за шагом', 'пошагово', 'поэтапно',
            'формально', 'математически', 'логически', 'вычислить',
            'математика', 'уравнение', 'формула', 'вероятность', 'статистика',
            'логическая задача', 'головоломка', 'вывести', 'умозаключение',
            // === Spanish ===
            'demostrar', 'teorema', 'derivar', 'paso a paso',
            'cadena de pensamiento', 'formalmente', 'matemático',
            'prueba', 'lógicamente', 'calcular', 'matemáticas',
            'ecuación', 'fórmula', 'probabilidad', 'estadística',
            'acertijo', 'deducir', 'inferir',
            // === Portuguese ===
            'provar', 'teorema', 'derivar', 'passo a passo',
            'formalmente', 'matemático', 'prova', 'logicamente',
            'calcular', 'equação', 'fórmula', 'probabilidade',
            'estatística', 'deduzir', 'inferir',
            // === Korean ===
            '증명', '정리', '도출', '단계별', '사고의 연쇄',
            '형식적', '수학적', '논리적', '계산', '수학',
            '방정식', '공식', '확률', '통계', '추론',
            // === Arabic ===
            'إثبات', 'نظرية', 'اشتقاق', 'خطوة بخطوة',
            'سلسلة التفكير', 'رسمياً', 'رياضي', 'برهان',
            'منطقياً', 'حساب', 'معادلة', 'صيغة', 'احتمالية',
            'إحصائيات', 'استنتاج', 'استدلال',
        ],
        useCases: ['reasoning', 'math', 'logic', 'proof', 'analysis-deep'],
    },
    // ═══════════════════════════════════════════════
    // TIER: CREATIVE — Kreative Modelle für Storytelling und Kreativität
    // ═══════════════════════════════════════════════
    {
        name: 'CREATIVE',
        models: [
            'anthropic/claude-sonnet-4.6',
            'mistralai/mistral-large',
        ],
        keywords: [
            // === English ===
            'story', 'poem', 'compose', 'brainstorm', 'creative', 'imagine',
            'write a', 'novel', 'fiction', 'character', 'plot', 'narrative',
            'lyrics', 'song', 'joke', 'humor', 'roleplay', 'fantasy',
            'dialogue', 'scene', 'chapter', 'script', 'screenplay',
            // === German ===
            'geschichte', 'gedicht', 'komponieren', 'brainstorming', 'kreativ',
            'vorstellen', 'schreibe', 'roman', 'fiktion', 'figur', 'handlung',
            'liedtext', 'song', 'witz', 'humor', 'rollenspiel', 'fantasy',
            'dialog', 'szene', 'kapitel', 'drehbuch',
            // === Chinese ===
            '故事', '诗', '创作', '头脑风暴', '创意', '想象',
            '写一个', '小说', '虚构', '角色', '情节',
            '歌词', '歌', '笑话', '幽默', '角色扮演', '幻想',
            '对话', '场景', '章节', '剧本',
            // === Japanese ===
            '物語', '詩', '作曲', 'ブレインストーム', '創造的', '想像',
            '小説', 'フィクション', 'キャラクター', 'プロット',
            '歌詞', 'ジョーク', 'ユーモア', 'ロールプレイ', 'ファンタジー',
            // === Russian ===
            'история', 'рассказ', 'стихотворение', 'сочинить', 'мозговой штурм',
            'творческий', 'представить', 'придумай', 'напиши', 'роман', 'фикция',
            'персонаж', 'сюжет', 'песня', 'шутка', 'юмор', 'фэнтези',
            'диалог', 'сцена', 'глава', 'сценарий',
            // === Spanish ===
            'historia', 'poema', 'componer', 'lluvia de ideas', 'creativo',
            'imaginar', 'escribe', 'novela', 'ficción', 'personaje',
            'letra', 'canción', 'chiste', 'humor', 'fantasía', 'diálogo',
            // === Portuguese ===
            'história', 'poema', 'compor', 'criativo', 'imaginar',
            'escreva', 'romance', 'ficção', 'personagem',
            'letra', 'canção', 'piada', 'humor', 'fantasia', 'diálogo',
            // === Korean ===
            '이야기', '시', '작곡', '브레인스토밍', '창의적', '상상',
            '소설', '허구', '캐릭터', '플롯',
            '가사', '노래', '농담', '유머', '롤플레잉', '판타지',
            // === Arabic ===
            'قصة', 'قصيدة', 'تأليف', 'عصف ذهني', 'إبداعي',
            'تخيل', 'اكتب', 'رواية', 'خيال', 'شخصية',
            'كلمات', 'أغنية', 'نكتة', 'فكاهة', 'خيال علمي', 'حوار',
        ],
        useCases: ['storytelling', 'poetry', 'creative-writing', 'brainstorming', 'roleplay'],
    },
    // ═══════════════════════════════════════════════
    // TIER: AGENTIC — Für Multi-Step, File-Ops, iterative Tasks
    // ═══════════════════════════════════════════════
    {
        name: 'AGENTIC',
        models: [
            'anthropic/claude-sonnet-4.6',
            'google/gemini-3-pro-preview',
        ],
        keywords: [
            // === English ===
            'read file', 'look at', 'check the', 'open the', 'edit file',
            'modify', 'update the', 'change the', 'write to', 'create file',
            'execute', 'deploy', 'install', 'npm', 'pip', 'compile',
            'after that', 'once done', 'step 1', 'step 2', 'then run',
            'fix the bug', 'debug', 'until it works', 'keep trying',
            'iterate', 'make sure', 'verify', 'confirm', 'run tests',
            // === German ===
            'lese datei', 'guck dir an', 'prüfe', 'öffne', 'bearbeite datei',
            'modifiziere', 'aktualisiere', 'ändere', 'schreibe in', 'erstelle datei',
            'ausführen', 'deployen', 'installieren', 'kompilieren',
            'danach', 'sobald fertig', 'schritt 1', 'schritt 2', 'dann ausführen',
            'behebe den bug', 'debuggen', 'bis es funktioniert', 'weiter probieren',
            'iterieren', 'stell sicher', 'verifiziere', 'bestätige', 'tests ausführen',
            // === Chinese ===
            '读取文件', '查看', '打开', '编辑', '修改', '更新',
            '执行', '部署', '安装', '编译',
            '之后', '完成后', '第一步', '第二步', '然后运行',
            '修复', '调试', '直到成功', '确认', '验证', '运行测试',
            // === Japanese ===
            'ファイル読み込み', '確認', '開く', '編集', '修正', '更新',
            '実行', 'デプロイ', 'インストール', 'コンパイル',
            'その後', '完了後', 'ステップ1', 'ステップ2',
            '修正', 'デバッグ', 'テスト実行', '確認', '検証',
            // === Russian ===
            'прочитать файл', 'посмотри', 'проверь', 'открой', 'редактировать',
            'изменить', 'обновить', 'записать в', 'создать файл',
            'выполнить', 'развернуть', 'установить', 'скомпилировать',
            'после этого', 'шаг 1', 'шаг 2', 'затем запустить',
            'исправить', 'отладить', 'убедиться', 'проверить', 'запустить тесты',
            // === Spanish ===
            'leer archivo', 'editar', 'modificar', 'actualizar',
            'ejecutar', 'desplegar', 'instalar', 'compilar',
            'después', 'paso 1', 'paso 2', 'verificar', 'confirmar',
            // === Portuguese ===
            'ler arquivo', 'editar', 'modificar', 'atualizar',
            'executar', 'implantar', 'instalar', 'compilar',
            'depois', 'passo 1', 'passo 2', 'verificar', 'confirmar',
            // === Korean ===
            '파일 읽기', '확인', '편집', '수정', '업데이트',
            '실행', '배포', '설치', '컴파일',
            '이후', '단계 1', '단계 2', '디버그', '검증', '테스트 실행',
            // === Arabic ===
            'قراءة ملف', 'تحرير', 'تعديل', 'تحديث',
            'تنفيذ', 'نشر', 'تثبيت', 'ترجمة',
            'بعد ذلك', 'الخطوة 1', 'الخطوة 2', 'تصحيح', 'تحقق', 'اختبار',
        ],
        useCases: ['agentic', 'multi-step', 'file-operations', 'execution', 'iterative'],
    },
];
/**
 * Fallback-Tier wenn keine Erkennung möglich
 */
export function getDefaultCategory() {
    return {
        name: 'DEFAULT',
        models: [
            'minimax/minimax-m2.5',
        ],
        keywords: [],
        useCases: ['fallback'],
    };
}
//# sourceMappingURL=models.js.map