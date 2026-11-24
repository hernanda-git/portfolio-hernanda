import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { copyToClipboard, downloadTextFile, simpleHash, slugFile } from './engineHelpers';
import type { DomainEngineProps } from './engineTypes';
import './engine-shell.css';

type AllergyClass = 'Penicillin' | 'Sulfonamide' | 'NSAID';

interface PatientProfile {
  id: string;
  name: string;
  ihsNumber: string;
  nik: string;
  gender: 'male' | 'female';
  birthDate: string;
  ageLabelEn: string;
  ageLabelId: string;
  payerType: 'BPJS' | 'PRIVATE';
  payerLabelEn: string;
  payerLabelId: string;
  sepNumber: string;
  poliCode: string;
  poliName: string;
  kodeBooking: string;
  allergyClass: AllergyClass;
  allergyLabelEn: string;
  allergyLabelId: string;
  allergyReactionEn: string;
  allergyReactionId: string;
  initialTaskId: number;
  initialIcd10: string;
  initialKfa: string;
  initialSoap: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
}

interface Icd10Option {
  code: string;
  displayEn: string;
  displayId: string;
}

interface KfaDrugOption {
  kfaCode: string;
  name: string;
  form: string;
  allergenClass: AllergyClass | 'Macrolide' | 'Analgesic' | 'CCB';
  sigEn: string;
  sigId: string;
  qty: number;
}

interface EncounterDraft {
  ihsNumber: string;
  taskId: number;
  stageElapsedSec: number;
  sepVerified: boolean;
  icd10Code: string;
  kfaCode: string;
  soap: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
}

const PATIENTS: PatientProfile[] = [
  {
    id: 'PTN-01',
    name: 'Ny. Siti Rahmawati',
    ihsNumber: 'P10002938471',
    nik: '3174055204850002',
    gender: 'female',
    birthDate: '1985-04-12',
    ageLabelEn: '41 yrs / Female',
    ageLabelId: '41 thn / Perempuan',
    payerType: 'BPJS',
    payerLabelEn: 'BPJS Kesehatan (Class 1)',
    payerLabelId: 'BPJS Kesehatan (Kelas 1)',
    sepNumber: '0112R0041126V000842',
    poliCode: 'INT',
    poliName: 'Poli Penyakit Dalam',
    kodeBooking: '20261124INT0014',
    allergyClass: 'Penicillin',
    allergyLabelEn: 'Penicillin (Severe Anaphylaxis)',
    allergyLabelId: 'Penisilin (Anafilaksis Berat)',
    allergyReactionEn: 'Generalized urticaria and airway edema reported in 2023',
    allergyReactionId: 'Urtikaria menyeluruh dan edema saluran napas tercatat tahun 2023',
    initialTaskId: 4,
    initialIcd10: 'J06.9',
    initialKfa: '93001480',
    initialSoap: {
      subjective: 'Demam 3 hari, nyeri telan, batuk kering sejak kemarin malam.',
      objective: 'TD 118/76 mmHg, N 88x/mnt, S 38.2 C, SpO2 98%, faring hiperemis (+).',
      assessment: 'Acute upper respiratory infection (ISPA Akut), riwayat alergi Penisilin.',
      plan: 'Terapi makrolida non-penisilin, antipiretik prn, edukasi hidrasi dan kontrol 3 hari.',
    },
  },
  {
    id: 'PTN-02',
    name: 'Tn. Budi Santoso',
    ihsNumber: 'P10008841209',
    nik: '3273011907740005',
    gender: 'male',
    birthDate: '1974-07-19',
    ageLabelEn: '52 yrs / Male',
    ageLabelId: '52 thn / Laki-laki',
    payerType: 'BPJS',
    payerLabelEn: 'BPJS Kesehatan (PBI)',
    payerLabelId: 'BPJS Kesehatan (PBI)',
    sepNumber: '0112R0041126V000915',
    poliCode: 'JANT',
    poliName: 'Poli Jantung & Hipertensi',
    kodeBooking: '20261124JAN0008',
    allergyClass: 'Sulfonamide',
    allergyLabelEn: 'Sulfonamide / Sulfa Drugs',
    allergyLabelId: 'Sulfonamida / Obat Sulfa',
    allergyReactionEn: 'Stevens-Johnson bullous rash history',
    allergyReactionId: 'Riwayat ruam bula berat akibat sulfonamida',
    initialTaskId: 3,
    initialIcd10: 'I10',
    initialKfa: '93003310',
    initialSoap: {
      subjective: 'Kontrol rutin tekanan darah, kadang pusing tengkuk saat pagi.',
      objective: 'TD 152/94 mmHg, N 76x/mnt, S 36.6 C, BMI 26.4 kg/m2.',
      assessment: 'Hipertensi esensial stage 1 terkontrol parsial.',
      plan: 'Lanjutkan Amlodipine 5 mg 1x1 pagi, diet rendah natrium, cek profil lipid.',
    },
  },
  {
    id: 'PTN-03',
    name: 'An. Nadia Putri',
    ihsNumber: 'P10005519034',
    nik: '3578044811160001',
    gender: 'female',
    birthDate: '2016-11-08',
    ageLabelEn: '10 yrs / Female',
    ageLabelId: '10 thn / Perempuan',
    payerType: 'PRIVATE',
    payerLabelEn: 'Mandiri Inhealth (Corporate Cashless)',
    payerLabelId: 'Mandiri Inhealth (Cashless Korporat)',
    sepNumber: 'INH-GL-2026-44109',
    poliCode: 'ANA',
    poliName: 'Poli Anak',
    kodeBooking: '20261124ANA0021',
    allergyClass: 'NSAID',
    allergyLabelEn: 'NSAID / Ibuprofen',
    allergyLabelId: 'NSAID / Ibuprofen',
    allergyReactionEn: 'Acute bronchospasm and periorbital swelling',
    allergyReactionId: 'Bronkospasme akut dan pembengkakan periorbital',
    initialTaskId: 2,
    initialIcd10: 'J02.9',
    initialKfa: '93000105',
    initialSoap: {
      subjective: 'Demam naik turun sejak 2 hari, nafsu makan menurun.',
      objective: 'BB 31 kg, N 96x/mnt, S 37.9 C, tonsil T2/T2 hiperemis ringan.',
      assessment: 'Faringitis akut ringan tanpa tanda obstruksi.',
      plan: 'Gunakan Paracetamol 500 mg (hindari seluruh golongan NSAID), observasi suhu.',
    },
  },
];

const ICD10_OPTIONS: Icd10Option[] = [
  { code: 'J06.9', displayEn: 'Acute upper respiratory infection, unspecified', displayId: 'Infeksi saluran napas atas akut tidak spesifik' },
  { code: 'J02.9', displayEn: 'Acute pharyngitis, unspecified', displayId: 'Faringitis akut tidak spesifik' },
  { code: 'I10', displayEn: 'Essential (primary) hypertension', displayId: 'Hipertensi esensial (primer)' },
  { code: 'E11.9', displayEn: 'Type 2 diabetes mellitus without complications', displayId: 'Diabetes melitus tipe 2 tanpa komplikasi' },
  { code: 'K30', displayEn: 'Functional dyspepsia', displayId: 'Dispepsia fungsional' },
];

const KFA_DRUGS: KfaDrugOption[] = [
  {
    kfaCode: '93001012',
    name: 'Amoxicillin 500 mg Capsule',
    form: 'Capsule',
    allergenClass: 'Penicillin',
    sigEn: '3 x 1 capsule after meal (7 days)',
    sigId: '3 x 1 kapsul sesudah makan (7 hari)',
    qty: 21,
  },
  {
    kfaCode: '93001480',
    name: 'Azithromycin 500 mg Tablet',
    form: 'Film-Coated Tablet',
    allergenClass: 'Macrolide',
    sigEn: '1 x 1 tablet daily (3 days)',
    sigId: '1 x 1 tablet per hari (3 hari)',
    qty: 3,
  },
  {
    kfaCode: '93000105',
    name: 'Paracetamol 500 mg Tablet',
    form: 'Tablet',
    allergenClass: 'Analgesic',
    sigEn: '3 x 1 tablet PRN fever',
    sigId: '3 x 1 tablet bila demam',
    qty: 10,
  },
  {
    kfaCode: '93000284',
    name: 'Ibuprofen 400 mg Tablet',
    form: 'Tablet',
    allergenClass: 'NSAID',
    sigEn: '3 x 1 tablet after meal',
    sigId: '3 x 1 tablet sesudah makan',
    qty: 10,
  },
  {
    kfaCode: '93002190',
    name: 'Cotrimoxazole 480 mg Tablet',
    form: 'Tablet',
    allergenClass: 'Sulfonamide',
    sigEn: '2 x 1 tablet daily (5 days)',
    sigId: '2 x 1 tablet per hari (5 hari)',
    qty: 10,
  },
  {
    kfaCode: '93003310',
    name: 'Amlodipine 5 mg Tablet',
    form: 'Tablet',
    allergenClass: 'CCB',
    sigEn: '1 x 1 tablet every morning',
    sigId: '1 x 1 tablet setiap pagi',
    qty: 30,
  },
];

const ANTREAN_STAGES = [
  { taskId: 1, titleEn: 'Booking', titleId: 'Booking', slaTargetSec: 300 },
  { taskId: 2, titleEn: 'Check-In', titleId: 'Check-In', slaTargetSec: 600 },
  { taskId: 3, titleEn: 'Poli Wait', titleId: 'Tunggu Poli', slaTargetSec: 900 },
  { taskId: 4, titleEn: 'Doctor Consult', titleId: 'Konsultasi', slaTargetSec: 900 },
  { taskId: 5, titleEn: 'Pharmacy Wait', titleId: 'Tunggu Obat', slaTargetSec: 1200 },
  { taskId: 6, titleEn: 'Dispense', titleId: 'Serah Obat', slaTargetSec: 300 },
  { taskId: 7, titleEn: 'Done', titleId: 'Selesai', slaTargetSec: 0 },
];

function createInitialDrafts(): Record<string, EncounterDraft> {
  const map: Record<string, EncounterDraft> = {};
  for (const p of PATIENTS) {
    map[p.id] = {
      ihsNumber: p.ihsNumber,
      taskId: p.initialTaskId,
      stageElapsedSec: p.initialTaskId * 95,
      sepVerified: true,
      icd10Code: p.initialIcd10,
      kfaCode: p.initialKfa,
      soap: { ...p.initialSoap },
    };
  }
  return map;
}

function formatTimer(totalSec: number): string {
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function ClinicalEmrEngine({ project }: DomainEngineProps) {
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  const [activeTab, setActiveTab] = useState<'workbench' | 'antrean' | 'fhir'>('workbench');
  const [selectedPatientId, setSelectedPatientId] = useState<string>(PATIENTS[0].id);
  const [drafts, setDrafts] = useState<Record<string, EncounterDraft>>(createInitialDrafts);
  const [copiedFhir, setCopiedFhir] = useState<boolean>(false);

  const activePatient = useMemo(
    () => PATIENTS.find((p) => p.id === selectedPatientId) ?? PATIENTS[0],
    [selectedPatientId]
  );
  const activeDraft = drafts[activePatient.id];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setDrafts((prev) => {
        const cur = prev[selectedPatientId];
        if (!cur || cur.taskId >= 7) return prev;
        return {
          ...prev,
          [selectedPatientId]: {
            ...cur,
            stageElapsedSec: cur.stageElapsedSec + 1,
          },
        };
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [selectedPatientId]);

  const updateDraft = (patch: Partial<EncounterDraft>) => {
    setDrafts((prev) => ({
      ...prev,
      [activePatient.id]: {
        ...prev[activePatient.id],
        ...patch,
      },
    }));
  };

  const updateSoap = (field: keyof EncounterDraft['soap'], value: string) => {
    setDrafts((prev) => ({
      ...prev,
      [activePatient.id]: {
        ...prev[activePatient.id],
        soap: {
          ...prev[activePatient.id].soap,
          [field]: value,
        },
      },
    }));
  };

  const selectedIcd10 = useMemo(
    () => ICD10_OPTIONS.find((c) => c.code === activeDraft.icd10Code) ?? null,
    [activeDraft.icd10Code]
  );

  const selectedDrug = useMemo(
    () => KFA_DRUGS.find((d) => d.kfaCode === activeDraft.kfaCode) ?? null,
    [activeDraft.kfaCode]
  );

  const allergyConflict = useMemo(() => {
    if (!selectedDrug) return false;
    return selectedDrug.allergenClass === activePatient.allergyClass;
  }, [selectedDrug, activePatient.allergyClass]);

  const validationChecks = useMemo(() => {
    const ihsValid = /^P\d{10,12}$/.test(activeDraft.ihsNumber.trim());
    const icdPresent = Boolean(selectedIcd10);
    const kfaPresent = Boolean(selectedDrug);
    const allergyClear = !allergyConflict;
    const soapPopulated = Boolean(activeDraft.soap.assessment.trim() && activeDraft.soap.plan.trim());

    return [
      {
        id: 'ihs',
        labelEn: 'SATUSEHAT Patient IHS Number format (P + 10-12 digits)',
        labelId: 'Format IHS Number Pasien SATUSEHAT (P + 10-12 digit)',
        passed: ihsValid,
        detail: ihsValid ? activeDraft.ihsNumber : (isEn ? 'Invalid or empty IHS identifier' : 'Identifier IHS tidak valid atau kosong'),
      },
      {
        id: 'icd10',
        labelEn: 'ICD-10 Condition Diagnosis Code present',
        labelId: 'Kode Diagnosis ICD-10 tersedia',
        passed: icdPresent,
        detail: selectedIcd10 ? `${selectedIcd10.code} - ${isEn ? selectedIcd10.displayEn : selectedIcd10.displayId}` : (isEn ? 'Missing ICD-10 code' : 'Kode ICD-10 belum dipilih'),
      },
      {
        id: 'kfa',
        labelEn: 'KFA Formulary Medication Code present',
        labelId: 'Kode Obat Formularium KFA tersedia',
        passed: kfaPresent,
        detail: selectedDrug ? `KFA ${selectedDrug.kfaCode} (${selectedDrug.name})` : (isEn ? 'Missing KFA drug code' : 'Kode obat KFA belum dipilih'),
      },
      {
        id: 'allergy',
        labelEn: 'Drug Safety & Allergy Contraindication Guard clear',
        labelId: 'Guard Keamanan Obat & Kontraindikasi Alergi aman',
        passed: allergyClear,
        detail: allergyClear
          ? (isEn ? 'No allergen class conflict' : 'Tidak ada konflik kelas alergen')
          : (isEn ? `CONFLICT: ${selectedDrug?.allergenClass} allergy` : `KONFLIK: Alergi ${selectedDrug?.allergenClass}`),
      },
      {
        id: 'soap',
        labelEn: 'SOAP Assessment & Clinical Plan documented',
        labelId: 'Asesmen & Rencana Klinis SOAP terisi',
        passed: soapPopulated,
        detail: soapPopulated ? (isEn ? 'Ready for RME signing' : 'Siap ditandatangani di RME') : (isEn ? 'Incomplete SOAP assessment/plan' : 'Asesmen atau rencana SOAP belum lengkap'),
      },
    ];
  }, [activeDraft, selectedIcd10, selectedDrug, allergyConflict, isEn]);

  const passedCount = validationChecks.filter((c) => c.passed).length;
  const fhirValid = passedCount === validationChecks.length;

  const fhirBundleJson = useMemo(() => {
    const encounterUuid = `urn:uuid:enc-${simpleHash(activePatient.id + activePatient.kodeBooking).slice(0, 12)}`;
    const patientRef = `Patient/${activeDraft.ihsNumber || 'INVALID-IHS'}`;
    const bundle = {
      resourceType: 'Bundle',
      id: `satusehat-rme-${activePatient.id.toLowerCase()}`,
      type: 'transaction',
      timestamp: '2026-11-24T15:10:00+07:00',
      entry: [
        {
          fullUrl: patientRef,
          resource: {
            resourceType: 'Patient',
            id: activeDraft.ihsNumber || 'MISSING',
            identifier: [
              { system: 'https://fhir.kemkes.go.id/id/ihs-number', value: activeDraft.ihsNumber },
              { system: 'https://fhir.kemkes.go.id/id/nik', value: activePatient.nik },
            ],
            name: [{ use: 'official', text: activePatient.name }],
            gender: activePatient.gender,
            birthDate: activePatient.birthDate,
          },
          request: { method: 'PUT', url: patientRef },
        },
        {
          fullUrl: encounterUuid,
          resource: {
            resourceType: 'Encounter',
            status: activeDraft.taskId >= 7 ? 'finished' : 'in-progress',
            class: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'AMB', display: 'ambulatory' },
            subject: { reference: patientRef, display: activePatient.name },
            period: { start: '2026-11-24T14:40:00+07:00' },
            serviceProvider: { reference: 'Organization/100028412', display: project.name },
            extension: [
              { url: 'https://fhir.kemkes.go.id/r4/StructureDefinition/bpjs-sep', valueString: activePatient.sepNumber },
            ],
          },
          request: { method: 'POST', url: 'Encounter' },
        },
        {
          fullUrl: `urn:uuid:cond-${activePatient.id.toLowerCase()}`,
          resource: {
            resourceType: 'Condition',
            clinicalStatus: {
              coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active' }],
            },
            code: selectedIcd10
              ? {
                  coding: [
                    {
                      system: 'http://hl7.org/fhir/sid/icd-10',
                      code: selectedIcd10.code,
                      display: isEn ? selectedIcd10.displayEn : selectedIcd10.displayId,
                    },
                  ],
                }
              : { text: 'MISSING_ICD10' },
            subject: { reference: patientRef },
            encounter: { reference: encounterUuid },
            note: [{ text: `SOAP Assessment: ${activeDraft.soap.assessment}` }],
          },
          request: { method: 'POST', url: 'Condition' },
        },
        {
          fullUrl: `urn:uuid:medreq-${activePatient.id.toLowerCase()}`,
          resource: {
            resourceType: 'MedicationRequest',
            status: allergyConflict ? 'stopped' : 'active',
            intent: 'order',
            medicationCodeableConcept: selectedDrug
              ? {
                  coding: [
                    {
                      system: 'http://sys-ids.kemkes.go.id/kfa',
                      code: selectedDrug.kfaCode,
                      display: selectedDrug.name,
                    },
                  ],
                }
              : { text: 'MISSING_KFA_CODE' },
            subject: { reference: patientRef },
            encounter: { reference: encounterUuid },
            dosageInstruction: [
              {
                text: selectedDrug ? (isEn ? selectedDrug.sigEn : selectedDrug.sigId) : 'Not prescribed',
              },
            ],
            dispenseRequest: {
              quantity: { value: selectedDrug?.qty ?? 0, unit: selectedDrug?.form ?? 'unit' },
            },
          },
          request: { method: 'POST', url: 'MedicationRequest' },
        },
      ],
    };
    return JSON.stringify(bundle, null, 2);
  }, [activePatient, activeDraft, selectedIcd10, selectedDrug, allergyConflict, project.name, isEn]);

  const triggerAllergyDemo = () => {
    const conflictDrugMap: Record<AllergyClass, string> = {
      Penicillin: '93001012', // Amoxicillin
      Sulfonamide: '93002190', // Cotrimoxazole
      NSAID: '93000284', // Ibuprofen
    };
    updateDraft({ kfaCode: conflictDrugMap[activePatient.allergyClass] });
  };

  const applySafeAlternative = () => {
    const safeDrugMap: Record<AllergyClass, string> = {
      Penicillin: '93001480', // Azithromycin
      Sulfonamide: '93003310', // Amlodipine
      NSAID: '93000105', // Paracetamol
    };
    updateDraft({ kfaCode: safeDrugMap[activePatient.allergyClass] });
  };

  const resetAllEncounters = () => {
    setDrafts(createInitialDrafts());
  };

  const currentStage = ANTREAN_STAGES.find((s) => s.taskId === activeDraft.taskId) ?? ANTREAN_STAGES[0];
  const slaRatioPct =
    currentStage.slaTargetSec > 0
      ? Math.min(100, Math.round((activeDraft.stageElapsedSec / currentStage.slaTargetSec) * 100))
      : 100;

  const antreanPayloadJson = useMemo(() => {
    return JSON.stringify(
      {
        endpoint: 'POST /antrean/updatewaktu',
        kodebooking: activePatient.kodeBooking,
        taskid: activeDraft.taskId,
        waktu: 1795507800000 + activeDraft.stageElapsedSec * 1000,
        sepNumber: activePatient.payerType === 'BPJS' ? activePatient.sepNumber : null,
        poli: activePatient.poliCode,
        diagnosaAwal: activeDraft.icd10Code || 'UNASSIGNED',
      },
      null,
      2
    );
  }, [activePatient, activeDraft.taskId, activeDraft.stageElapsedSec, activeDraft.icd10Code]);

  const handleCopyFhir = async () => {
    const ok = await copyToClipboard(fhirBundleJson);
    if (ok) {
      setCopiedFhir(true);
      window.setTimeout(() => setCopiedFhir(false), 1800);
    }
  };

  const handleDownloadFhir = () => {
    downloadTextFile(
      `${slugFile(project.name)}-${activePatient.id.toLowerCase()}-fhir-r4.json`,
      fhirBundleJson,
      'application/fhir+json'
    );
  };

  return (
    <section className="eng-shell" aria-label={`${project.name} Clinical EMR Engine`}>
      <div className="eng-topbar">
        <div>
          <div className="eng-eyebrow">
            <span className="status-dot ok" />
            <span>
              {project.id} | {isEn ? 'SATUSEHAT FHIR R4 & BPJS Antrean Engine' : 'Engine SATUSEHAT FHIR R4 & Antrean BPJS'}
            </span>
            <span>|</span>
            <span>{project.standards.slice(0, 2).join(' | ')}</span>
          </div>
          <h2 className="eng-title">{project.name}</h2>
        </div>
        <div className="eng-actions">
          <button type="button" className="btn btn-sm" onClick={triggerAllergyDemo}>
            {isEn ? 'Simulate Allergy Conflict' : 'Simulasi Konflik Alergi'}
          </button>
          <button type="button" className="btn btn-sm" onClick={resetAllEncounters}>
            {isEn ? 'Reset Encounters' : 'Reset Kunjungan'}
          </button>
          <button type="button" className="btn btn-sm btn-primary" onClick={handleDownloadFhir}>
            {isEn ? 'Download FHIR R4 JSON' : 'Unduh FHIR R4 JSON'}
          </button>
        </div>
      </div>

      {/* Top KPI Strip */}
      <div className="eng-kpi-row">
        <div className="eng-kpi">
          <span className="eng-kpi-label">{isEn ? 'Active Task ID' : 'Task ID Aktif'}</span>
          <span className={`eng-kpi-val ${activeDraft.taskId === 7 ? 'is-ok' : 'is-accent'}`}>
            Task {activeDraft.taskId}/7
          </span>
          <span className="eng-kpi-sub">
            {isEn ? currentStage.titleEn : currentStage.titleId} | {formatTimer(activeDraft.stageElapsedSec)}
          </span>
        </div>
        <div className="eng-kpi">
          <span className="eng-kpi-label">{isEn ? 'FHIR R4 Validation' : 'Validasi FHIR R4'}</span>
          <span className={`eng-kpi-val ${fhirValid ? 'is-ok' : 'is-bad'}`}>
            {fhirValid ? 'PASS' : 'FAIL'}
          </span>
          <span className="eng-kpi-sub">
            {passedCount}/{validationChecks.length} {isEn ? 'rules passed' : 'aturan lolos'}
          </span>
        </div>
        <div className="eng-kpi">
          <span className="eng-kpi-label">{isEn ? 'Drug Safety Guard' : 'Guard Keamanan Obat'}</span>
          <span className={`eng-kpi-val ${allergyConflict ? 'is-bad' : 'is-ok'}`}>
            {allergyConflict ? 'ALERT' : 'CLEAR'}
          </span>
          <span className="eng-kpi-sub">
            {allergyConflict
              ? (isEn ? `${activePatient.allergyClass} contraindication` : `Kontraindikasi ${activePatient.allergyClass}`)
              : (isEn ? 'Zero allergy conflicts' : 'Bebas konflik alergi')}
          </span>
        </div>
        <div className="eng-kpi">
          <span className="eng-kpi-label">{isEn ? 'Payer / SEP Status' : 'Status Penjamin / SEP'}</span>
          <span className={`eng-kpi-val ${activeDraft.sepVerified ? 'is-ok' : 'is-warn'}`}>
            {activePatient.payerType === 'BPJS'
              ? (activeDraft.sepVerified ? 'SEP ACTIVE' : 'SEP DRAFT')
              : 'PRIVATE GL'}
          </span>
          <span className="eng-kpi-sub">{activePatient.sepNumber}</span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="eng-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'workbench'}
          className={`lens-chip ${activeTab === 'workbench' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('workbench')}
        >
          {isEn ? '01 Clinical Encounter Workbench' : '01 Workbench Kunjungan Klinis'}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'antrean'}
          className={`lens-chip ${activeTab === 'antrean' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('antrean')}
        >
          {isEn ? '02 BPJS Antrean Task 1-7 & VClaim SEP' : '02 Antrean BPJS Task 1-7 & SEP VClaim'}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'fhir'}
          className={`lens-chip ${activeTab === 'fhir' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('fhir')}
        >
          {isEn ? '03 SATUSEHAT FHIR R4 Bundle & Validator' : '03 Bundle & Validator FHIR R4 SATUSEHAT'}
        </button>
      </div>

      {/* Tab 01: Clinical Encounter Workbench */}
      {activeTab === 'workbench' && (
        <div className="eng-grid-2">
          <div className="eng-card">
            <div className="eng-card-head">
              <h3 className="eng-card-title">{isEn ? 'Patient Queue & Allergy Profile' : 'Antrean Pasien & Profil Alergi'}</h3>
              <span className="tag tag-mono">IHS + NIK</span>
            </div>
            <div className="eng-list">
              {PATIENTS.map((pt) => {
                const ptDraft = drafts[pt.id];
                const ptDrug = KFA_DRUGS.find((d) => d.kfaCode === ptDraft.kfaCode);
                const ptConflict = Boolean(ptDrug && ptDrug.allergenClass === pt.allergyClass);
                const isSelected = pt.id === activePatient.id;
                return (
                  <button
                    key={pt.id}
                    type="button"
                    className={`eng-row ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => setSelectedPatientId(pt.id)}
                  >
                    <div className="eng-row-main">
                      <div className="eng-row-title">
                        <span style={{ fontFamily: 'var(--ui-mono)', fontSize: '11px', color: 'var(--ui-text-muted)', marginRight: '6px' }}>
                          {pt.id}
                        </span>
                        {pt.name}
                      </div>
                      <div className="eng-row-sub">
                        IHS {ptDraft.ihsNumber} | {isEn ? pt.payerLabelEn : pt.payerLabelId}
                      </div>
                      <div className="eng-row-sub">
                        {isEn ? 'Allergy:' : 'Alergi:'} <strong>{isEn ? pt.allergyLabelEn : pt.allergyLabelId}</strong>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                      <span className={`tag ${ptConflict ? 'tag-bad' : 'tag-ok'}`}>
                        {ptConflict ? 'ALLERGY ALERT' : `Task ${ptDraft.taskId}/7`}
                      </span>
                      <span className="tag tag-mono">{pt.poliCode}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="eng-card-body" style={{ borderTop: '1px solid var(--ui-line)' }}>
              <div className="eng-field-label">{isEn ? 'Active Patient Demographics' : 'Demografi Pasien Aktif'}</div>
              <div className="eng-kv-list">
                <span className="eng-kv-k">NIK</span>
                <span className="eng-kv-v">{activePatient.nik}</span>
                <span className="eng-kv-k">Age / Sex</span>
                <span className="eng-kv-v">{isEn ? activePatient.ageLabelEn : activePatient.ageLabelId}</span>
                <span className="eng-kv-k">{isEn ? 'Documented Allergy' : 'Alergi Tercatat'}</span>
                <span className="eng-kv-v">{isEn ? activePatient.allergyReactionEn : activePatient.allergyReactionId}</span>
              </div>
            </div>
          </div>

          <div className="eng-card">
            <div className="eng-card-head">
              <h3 className="eng-card-title">{isEn ? 'SOAP Editor, ICD-10 & KFA Prescription' : 'Editor SOAP, ICD-10 & Resep KFA'}</h3>
              <span className={`tag ${allergyConflict ? 'tag-bad' : 'tag-accent'}`}>
                {activePatient.poliName}
              </span>
            </div>
            <div className="eng-card-body">
              {allergyConflict ? (
                <div className="eng-banner is-bad">
                  <div style={{ fontWeight: 700, marginBottom: '4px' }}>
                    {isEn
                      ? `CONTRAINDICATION GUARD TRIGGERED: ${selectedDrug?.name}`
                      : `PERINGATAN KONTRAINDIKASI ALERGI: ${selectedDrug?.name}`}
                  </div>
                  <div>
                    {isEn
                      ? `Drug belongs to ${selectedDrug?.allergenClass} class, which directly conflicts with documented allergy (${activePatient.allergyLabelEn}). Prescription blocked from FHIR signing.`
                      : `Obat termasuk golongan ${selectedDrug?.allergenClass}, bertentangan dengan riwayat alergi pasien (${activePatient.allergyLabelId}). Resep diblokir dari penandatanganan FHIR.`}
                  </div>
                  <div style={{ marginTop: '8px' }}>
                    <button type="button" className="btn btn-sm" onClick={applySafeAlternative}>
                      {isEn ? 'Switch to Safe Alternative' : 'Ganti ke Alternatif Aman'}
                    </button>
                  </div>
                </div>
              ) : selectedDrug ? (
                <div className="eng-banner is-ok">
                  {isEn
                    ? `Drug Safety Guard CLEAR: ${selectedDrug.name} (KFA ${selectedDrug.kfaCode}) has no conflict with ${activePatient.allergyClass} allergy profile.`
                    : `Guard Keamanan Obat AMAN: ${selectedDrug.name} (KFA ${selectedDrug.kfaCode}) tidak bertentangan dengan profil alergi ${activePatient.allergyClass}.`}
                </div>
              ) : (
                <div className="eng-banner is-warn">
                  {isEn
                    ? 'No KFA formulary medication selected yet. Select a drug to run safety screening and populate MedicationRequest.'
                    : 'Belum ada obat formularium KFA yang dipilih. Pilih obat untuk skrining alergi dan mengisi MedicationRequest.'}
                </div>
              )}

              <div className="eng-form-grid">
                <div>
                  <label className="eng-field-label" htmlFor="emr-ihs">SATUSEHAT IHS Number</label>
                  <input
                    id="emr-ihs"
                    className="eng-input"
                    value={activeDraft.ihsNumber}
                    onChange={(e) => updateDraft({ ihsNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="eng-field-label" htmlFor="emr-icd10">
                    {isEn ? 'ICD-10 Diagnosis Code' : 'Kode Diagnosis ICD-10'}
                  </label>
                  <select
                    id="emr-icd10"
                    className="eng-select"
                    value={activeDraft.icd10Code}
                    onChange={(e) => updateDraft({ icd10Code: e.target.value })}
                  >
                    <option value="">{isEn ? '-- Missing / Uncoded ICD-10 --' : '-- Belum Dipilih / Kosong --'}</option>
                    {ICD10_OPTIONS.map((opt) => (
                      <option key={opt.code} value={opt.code}>
                        {opt.code} - {isEn ? opt.displayEn : opt.displayId}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="eng-field-label" htmlFor="emr-kfa">
                  {isEn ? 'KFA Formulary Medication' : 'Obat Formularium KFA Kemenkes'}
                </label>
                <select
                  id="emr-kfa"
                  className="eng-select"
                  value={activeDraft.kfaCode}
                  onChange={(e) => updateDraft({ kfaCode: e.target.value })}
                >
                  <option value="">{isEn ? '-- No Medication Selected --' : '-- Tanpa Resep Obat --'}</option>
                  {KFA_DRUGS.map((drug) => (
                    <option key={drug.kfaCode} value={drug.kfaCode}>
                      KFA {drug.kfaCode} | {drug.name} ({drug.allergenClass})
                    </option>
                  ))}
                </select>
              </div>

              <div className="eng-form-grid">
                <div>
                  <label className="eng-field-label" htmlFor="soap-s">S - {isEn ? 'Subjective' : 'Subjektif'}</label>
                  <textarea
                    id="soap-s"
                    className="eng-textarea"
                    value={activeDraft.soap.subjective}
                    onChange={(e) => updateSoap('subjective', e.target.value)}
                  />
                </div>
                <div>
                  <label className="eng-field-label" htmlFor="soap-o">O - {isEn ? 'Objective' : 'Objektif'}</label>
                  <textarea
                    id="soap-o"
                    className="eng-textarea"
                    value={activeDraft.soap.objective}
                    onChange={(e) => updateSoap('objective', e.target.value)}
                  />
                </div>
                <div>
                  <label className="eng-field-label" htmlFor="soap-a">A - {isEn ? 'Assessment' : 'Asesmen'}</label>
                  <textarea
                    id="soap-a"
                    className="eng-textarea"
                    value={activeDraft.soap.assessment}
                    onChange={(e) => updateSoap('assessment', e.target.value)}
                  />
                </div>
                <div>
                  <label className="eng-field-label" htmlFor="soap-p">P - {isEn ? 'Plan' : 'Rencana Terapi'}</label>
                  <textarea
                    id="soap-p"
                    className="eng-textarea"
                    value={activeDraft.soap.plan}
                    onChange={(e) => updateSoap('plan', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 02: Interactive BPJS Antrean Online Task ID 1-7 & VClaim SEP Stepper */}
      {activeTab === 'antrean' && (
        <div className="eng-card">
          <div className="eng-card-head">
            <h3 className="eng-card-title">
              {isEn ? 'BPJS Antrean Online Task ID 1-7 & VClaim SEP Pipeline' : 'Alur Antrean Online BPJS Task ID 1-7 & VClaim SEP'}
            </h3>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => updateDraft({ taskId: 1, stageElapsedSec: 0 })}
              >
                {isEn ? 'Reset to Task 1' : 'Reset ke Task 1'}
              </button>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                disabled={activeDraft.taskId >= 7}
                onClick={() =>
                  updateDraft({
                    taskId: Math.min(7, activeDraft.taskId + 1),
                    stageElapsedSec: 0,
                  })
                }
              >
                {activeDraft.taskId >= 7
                  ? (isEn ? 'Completed (Task 7)' : 'Selesai (Task 7)')
                  : (isEn ? `Advance to Task ${activeDraft.taskId + 1}` : `Lanjut ke Task ${activeDraft.taskId + 1}`)}
              </button>
            </div>
          </div>
          <div className="eng-card-body">
            <div className="eng-stepper" role="group" aria-label="BPJS Antrean Task ID 1 to 7">
              {ANTREAN_STAGES.map((stage) => {
                const isDone = stage.taskId < activeDraft.taskId || (activeDraft.taskId === 7 && stage.taskId === 7);
                const isActive = stage.taskId === activeDraft.taskId && activeDraft.taskId < 7;
                return (
                  <button
                    key={stage.taskId}
                    type="button"
                    className={`eng-step ${isDone ? 'is-done' : isActive ? 'is-active' : ''}`}
                    onClick={() => updateDraft({ taskId: stage.taskId, stageElapsedSec: 0 })}
                  >
                    <span style={{ fontFamily: 'var(--ui-mono)', fontSize: '10.5px' }}>
                      Task {stage.taskId}
                    </span>
                    <span style={{ fontSize: '12px' }}>
                      {isEn ? stage.titleEn : stage.titleId}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="eng-grid-equal">
              <div className="eng-sensor-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '12.5px' }}>
                    {isEn ? 'Live Stage Elapsed SLA Timer' : 'Timer SLA Tahap Berjalan'}
                  </span>
                  <span style={{ fontFamily: 'var(--ui-mono)', fontWeight: 700, fontSize: '14px' }}>
                    {formatTimer(activeDraft.stageElapsedSec)}
                    {currentStage.slaTargetSec > 0 ? ` / ${formatTimer(currentStage.slaTargetSec)}` : ''}
                  </span>
                </div>
                <div className="eng-bar-track">
                  <div
                    className={`eng-bar-fill ${slaRatioPct >= 90 && currentStage.slaTargetSec > 0 ? 'is-warn' : 'is-ok'}`}
                    style={{ width: `${slaRatioPct}%` }}
                  />
                </div>
                <div className="eng-kv-list" style={{ marginTop: '4px' }}>
                  <span className="eng-kv-k">Kode Booking</span>
                  <span className="eng-kv-v">{activePatient.kodeBooking}</span>
                  <span className="eng-kv-k">Poli Tujuan</span>
                  <span className="eng-kv-v">{activePatient.poliCode} - {activePatient.poliName}</span>
                  <span className="eng-kv-k">{isEn ? 'Payer / SEP' : 'Penjamin / SEP'}</span>
                  <span className="eng-kv-v">{activePatient.sepNumber}</span>
                  <span className="eng-kv-k">VClaim SEP</span>
                  <span className="eng-kv-v">
                    <button
                      type="button"
                      className={`tag ${activeDraft.sepVerified ? 'tag-ok' : 'tag-warn'}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => updateDraft({ sepVerified: !activeDraft.sepVerified })}
                    >
                      {activeDraft.sepVerified
                        ? (isEn ? 'SEP ELIGIBLE (Click to toggle)' : 'SEP TERBIT (Klik untuk ubah)')
                        : (isEn ? 'SEP PENDING (Click to issue)' : 'SEP MENUNGGU (Klik untuk terbit)')}
                    </button>
                  </span>
                </div>
              </div>

              <div>
                <div className="eng-field-label">
                  {isEn ? 'Live BPJS Antrean /updatewaktu Payload' : 'Payload Langsung BPJS Antrean /updatewaktu'}
                </div>
                <pre className="eng-code">{antreanPayloadJson}</pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 03: Live SATUSEHAT HL7 FHIR R4 Bundle Generator & Validator */}
      {activeTab === 'fhir' && (
        <div className="eng-grid-2">
          <div className="eng-card">
            <div className="eng-card-head">
              <h3 className="eng-card-title">
                {isEn ? 'SATUSEHAT HL7 FHIR R4 Pre-Flight Validator' : 'Validator Pra-Kirim HL7 FHIR R4 SATUSEHAT'}
              </h3>
              <span className={`tag ${fhirValid ? 'tag-ok' : 'tag-bad'}`}>
                {fhirValid ? 'PASS' : 'FAIL'} ({passedCount}/{validationChecks.length})
              </span>
            </div>
            <div className="eng-card-body">
              <div className={`eng-banner ${fhirValid ? 'is-ok' : 'is-bad'}`}>
                {fhirValid
                  ? (isEn
                      ? 'All SATUSEHAT R4 clinical, terminology (ICD-10 & KFA), and drug safety guards passed. Bundle ready for Kemenkes submission.'
                      : 'Seluruh aturan SATUSEHAT R4, terminologi (ICD-10 & KFA), dan guard keamanan obat lolos. Bundle siap dikirim ke Kemenkes.')
                  : (isEn
                      ? 'Validation FAILED. Resolve the flagged clinical or coding items in Tab 01 before transmitting to SATUSEHAT.'
                      : 'Validasi GAGAL. Perbaiki item klinis atau koding yang ditandai pada Tab 01 sebelum mengirim ke SATUSEHAT.')}
              </div>

              <div className="eng-list" style={{ border: '1px solid var(--ui-line)', borderRadius: 'var(--ui-r-3)' }}>
                {validationChecks.map((chk) => (
                  <div key={chk.id} className="eng-row" style={{ cursor: 'default' }}>
                    <div className="eng-row-main">
                      <div className="eng-row-title">{isEn ? chk.labelEn : chk.labelId}</div>
                      <div className="eng-row-sub">{chk.detail}</div>
                    </div>
                    <span className={`tag ${chk.passed ? 'tag-ok' : 'tag-bad'}`}>
                      {chk.passed ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="eng-card">
            <div className="eng-card-head">
              <h3 className="eng-card-title">
                {isEn ? 'Generated FHIR R4 Transaction Bundle' : 'Bundle Transaksi FHIR R4 Terbentuk'}
              </h3>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button type="button" className="btn btn-sm" onClick={handleCopyFhir}>
                  {copiedFhir ? (isEn ? 'Copied' : 'Tersalin') : (isEn ? 'Copy JSON' : 'Salin JSON')}
                </button>
                <button type="button" className="btn btn-sm btn-primary" onClick={handleDownloadFhir}>
                  {isEn ? 'Download FHIR JSON' : 'Unduh FHIR JSON'}
                </button>
              </div>
            </div>
            <div className="eng-card-body">
              <pre className="eng-code" style={{ maxHeight: '420px' }}>{fhirBundleJson}</pre>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
