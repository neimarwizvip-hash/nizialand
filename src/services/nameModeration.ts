// NISIALAND - Player Name Moderation & Safety Service
// Protects students against inappropriate, offensive, or malicious usernames

const BLOCKED_WORDS: string[] = [
  // Profanities (Portuguese & English)
  'merda', 'bosta', 'porra', 'caralho', 'puta', 'puto', 'viado', 'viadinho',
  'arrombado', 'foder', 'foda', 'cacete', 'cu', 'buceta', 'piroca', 'pica',
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'dick', 'pussy', 'nigger',
  'cunt', 'cock', 'fag', 'retard', 'idiot', 'otario', 'imbecil', 'babaca',
  'nazista', 'hitler', 'racista', 'estupro', 'morte', 'suicidio'
];

// Leetspeak substitutions map
const LEET_MAP: Record<string, string> = {
  '0': 'o',
  '1': 'i',
  '3': 'e',
  '4': 'a',
  '@': 'a',
  '5': 's',
  '$': 's',
  '7': 't',
  '8': 'b',
  '!': 'i'
};

export interface NameValidationResult {
  isValid: boolean;
  sanitizedName: string;
  errorMessage?: string;
}

export interface ReportedNameRecord {
  id: string;
  playerId: string;
  reportedName: string;
  reportedAt: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
}

export const sanitizeAndValidateName = (rawName: string): NameValidationResult => {
  if (!rawName || typeof rawName !== 'string') {
    return {
      isValid: false,
      sanitizedName: '',
      errorMessage: 'Por favor, digite seu nome ou apelido escolar.'
    };
  }

  // 1. Basic trim and collapse multiple spaces
  let clean = rawName.trim().replace(/\s+/g, ' ');

  // 2. Length check
  if (clean.length < 2) {
    return {
      isValid: false,
      sanitizedName: clean,
      errorMessage: 'O nome precisa ter pelo menos 2 caracteres.'
    };
  }

  if (clean.length > 30) {
    return {
      isValid: false,
      sanitizedName: clean.slice(0, 30),
      errorMessage: 'O nome pode ter no máximo 30 caracteres.'
    };
  }

  // 3. Normalization for leetspeak checking
  let normalized = clean.toLowerCase();
  for (const [leet, real] of Object.entries(LEET_MAP)) {
    normalized = normalized.split(leet).join(real);
  }
  // Strip non-alphanumeric for offensive phrase check
  const alphaOnly = normalized.replace(/[^a-z0-9]/g, '');

  for (const bad of BLOCKED_WORDS) {
    if (alphaOnly.includes(bad)) {
      return {
        isValid: false,
        sanitizedName: clean,
        errorMessage: 'Por favor, use um nome respeitoso e apropriado para o ambiente escolar.'
      };
    }
  }

  return {
    isValid: true,
    sanitizedName: clean
  };
};

const REPORTED_NAMES_KEY = 'nisialand_reported_names';

export const nameModerationService = {
  validate(name: string): NameValidationResult {
    return sanitizeAndValidateName(name);
  },

  reportName(playerId: string, reportedName: string, reason: string = 'Nome inadequado'): boolean {
    try {
      const existingStr = localStorage.getItem(REPORTED_NAMES_KEY);
      const reports: ReportedNameRecord[] = existingStr ? JSON.parse(existingStr) : [];

      const newReport: ReportedNameRecord = {
        id: `rep_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        playerId,
        reportedName,
        reportedAt: new Date().toISOString(),
        reason,
        status: 'pending'
      };

      reports.push(newReport);
      localStorage.setItem(REPORTED_NAMES_KEY, JSON.stringify(reports));
      return true;
    } catch (e) {
      console.error('Failed to report name:', e);
      return false;
    }
  },

  getReports(): ReportedNameRecord[] {
    try {
      const existingStr = localStorage.getItem(REPORTED_NAMES_KEY);
      return existingStr ? JSON.parse(existingStr) : [];
    } catch {
      return [];
    }
  },

  resolveReport(reportId: string, status: 'resolved' | 'dismissed'): void {
    try {
      const reports = this.getReports();
      const updated = reports.map(r => r.id === reportId ? { ...r, status } : r);
      localStorage.setItem(REPORTED_NAMES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  }
};
