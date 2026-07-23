"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppLayout } from "@/components/layout/AppLayout";
import { formatPlate } from "@/lib/formatPlate";
import {
  BRANDS,
  COLORS,
  buildYears,
  motorcycleWizardSchema,
  type MotorcycleFormValues,
  STEP_FIELDS,
  evaluatePlate,
  isKnownModel,
  filterModels,
  buildModelsUrl,
  parseSubmitError,
} from "./wizardLogic";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMotorcycle,
  faGaugeHigh,
  faChevronRight,
  faChevronLeft,
  faCheck,
  faIdCard,
  faEuroSign,
  faCircleNotch,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";

const currentYear = new Date().getFullYear();
const YEARS = buildYears(currentYear);

type FormValues = MotorcycleFormValues;

const STEPS = [
  { label: "Identité",  icon: faMotorcycle },
  { label: "Détails",   icon: faIdCard },
  { label: "Achat",     icon: faEuroSign },
];

export default function AddMotorcyclePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("");

  // Immatriculation
  const [plateInput, setPlateInput] = useState("");
  const [plateValid, setPlateValid] = useState<boolean | null>(null);

  function handlePlateChange(raw: string) {
    const formatted = formatPlate(raw);
    setPlateInput(formatted);
    setValue("licensePlate", formatted, { shouldValidate: true });
    setPlateValid(evaluatePlate(formatted));
  }

  // Autocomplete modèle
  const [models, setModels] = useState<string[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelInput, setModelInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [modelValid, setModelValid] = useState<boolean | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(motorcycleWizardSchema),
    defaultValues: { currentMileage: 0, year: currentYear },
  });

  const watchBrand = watch("brand");
  const watchYear  = watch("year");

  // Charger les modèles depuis NHTSA quand la marque ou l'année change
  useEffect(() => {
    if (!watchBrand || watchBrand === "Autre") {
      setModels([]);
      setModelValid(null);
      return;
    }
    setModelsLoading(true);
    setModelValid(null);
    fetch(buildModelsUrl(watchBrand, watchYear))
      .then((r) => r.json())
      .then((data) => setModels(data.models ?? []))
      .catch(() => setModels([]))
      .finally(() => setModelsLoading(false));
  }, [watchBrand, watchYear]);

  // Valider le modèle saisi
  function validateModel(value: string) {
    setModelValid(isKnownModel(value, models));
  }

  function selectModel(model: string) {
    setModelInput(model);
    setValue("model", model, { shouldValidate: true });
    setModelValid(true);
    setShowSuggestions(false);
  }

  const filteredSuggestions = filterModels(models, modelInput);

  async function goNext() {
    const valid = await trigger(STEP_FIELDS[step]);
    if (valid) setStep((s) => s + 1);
  }

  async function onSubmit(data: FormValues) {
    setError(null);
    try {
      const res = await fetch("/api/motorcycles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(parseSubmitError(body, res.status));
      }
      router.push("/garage");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <AppLayout title="Ajouter une moto">
      <div className="max-w-2xl">

        {/* Stepper */}
        <div className="flex items-center gap-0 mb-10">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  i < step  ? "bg-primary text-white shadow-lg shadow-primary/30" :
                  i === step ? "bg-primary text-white shadow-lg shadow-primary/30 ring-4 ring-primary/20" :
                               "bg-white/5 text-white/30"
                }`}>
                  {i < step
                    ? <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />
                    : <FontAwesomeIcon icon={s.icon} className="h-4 w-4" />
                  }
                </div>
                <span className={`text-xs mt-1.5 font-medium ${i === step ? "text-white" : "text-white/30"}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-3 mb-4 transition-all ${i < step ? "bg-primary" : "bg-white/[0.06]"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-[#0e0e0e] border border-white/[0.07] rounded-2xl p-8 space-y-6">

            {/* ── STEP 0 : Identité ── */}
            {step === 0 && (
              <>
                <SectionTitle>Informations essentielles</SectionTitle>

                {/* Marque */}
                <div className="space-y-2">
                  <FieldLabel required>Marque</FieldLabel>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {BRANDS.map((b) => (
                      <button
                        key={b.name}
                        type="button"
                        onClick={() => setValue("brand", b.name, { shouldValidate: true })}
                        className={`py-2 px-1 rounded-xl text-xs font-bold text-center transition-all border flex flex-col items-center gap-0.5 ${
                          watchBrand === b.name
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-white/[0.03] border-white/[0.06] text-white/50 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        {b.origin && <span className="text-base leading-none">{b.origin}</span>}
                        <span>{b.name}</span>
                      </button>
                    ))}
                  </div>
                  {errors.brand && <FieldError>{errors.brand.message}</FieldError>}
                </div>

                {/* Modèle */}
                <div className="space-y-2">
                  <FieldLabel required>
                    Modèle
                    {modelsLoading && (
                      <FontAwesomeIcon icon={faCircleNotch} className="ml-2 h-3 w-3 animate-spin text-primary/60" />
                    )}
                    {!modelsLoading && models.length > 0 && (
                      <span className="ml-2 text-white/25 font-normal text-xs">{models.length} modèles trouvés</span>
                    )}
                  </FieldLabel>

                  <div className="relative" ref={suggestionsRef}>
                    <div className="relative">
                      <StyledInput
                        id="model"
                        placeholder={
                          !watchBrand ? "Sélectionnez d'abord une marque" :
                          modelsLoading ? "Chargement des modèles..." :
                          models.length > 0 ? `ex. ${models[0]}` : "Saisissez le modèle"
                        }
                        value={modelInput}
                        disabled={!watchBrand}
                        autoComplete="off"
                        onChange={(e) => {
                          setModelInput(e.target.value);
                          setValue("model", e.target.value, { shouldValidate: false });
                          setShowSuggestions(true);
                          validateModel(e.target.value);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                        className={
                          modelValid === true  ? "border-green-500/60 pr-10" :
                          modelValid === false ? "border-yellow-500/60 pr-10" : "pr-10"
                        }
                      />
                      {/* Icône de statut */}
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        {modelValid === true  && <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-green-500" />}
                        {modelValid === false && <FontAwesomeIcon icon={faTriangleExclamation} className="h-3.5 w-3.5 text-yellow-500" />}
                      </span>
                    </div>

                    {/* Suggestions dropdown */}
                    {showSuggestions && filteredSuggestions.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                        {filteredSuggestions.map((m) => (
                          <button
                            key={m}
                            type="button"
                            onMouseDown={() => selectModel(m)}
                            className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:bg-primary/10 hover:text-white transition-colors flex items-center justify-between group"
                          >
                            <span>{m}</span>
                            <FontAwesomeIcon icon={faCheck} className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Feedback */}
                  {modelValid === false && modelInput && (
                    <p className="text-xs text-yellow-500/80 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faTriangleExclamation} className="h-3 w-3" />
                      Modèle non reconnu pour {watchBrand}   vérifiez l'orthographe ou continuez quand même.
                    </p>
                  )}
                  {modelValid === true && (
                    <p className="text-xs text-green-500/80 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faCheck} className="h-3 w-3" />
                      Modèle vérifié dans la base de données.
                    </p>
                  )}
                  {errors.model && <FieldError>{errors.model.message}</FieldError>}
                </div>

                {/* Année + Kilométrage */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <FieldLabel required>Année</FieldLabel>
                    <select
                      {...register("year")}
                      className="w-full bg-[#161616] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors appearance-none"
                    >
                      {YEARS.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <FieldLabel required>Kilométrage actuel</FieldLabel>
                    <div className="relative">
                      <StyledInput
                        id="currentMileage"
                        type="number"
                        min="0"
                        placeholder="0"
                        {...register("currentMileage")}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/30 font-medium pointer-events-none">km</span>
                    </div>
                    {errors.currentMileage && <FieldError>{errors.currentMileage.message}</FieldError>}
                  </div>
                </div>
              </>
            )}

            {/* ── STEP 1 : Détails ── */}
            {step === 1 && (
              <>
                <SectionTitle>Caractéristiques</SectionTitle>

                {/* Couleur */}
                <div className="space-y-3">
                  <FieldLabel>Couleur principale</FieldLabel>
                  <div className="flex flex-wrap gap-2.5">
                    {COLORS.map((c) => (
                      <button
                        key={c.label}
                        type="button"
                        title={c.label}
                        onClick={() => {
                          setSelectedColor(c.label);
                          setValue("color", c.label);
                        }}
                        className={`relative w-9 h-9 rounded-full transition-all ${
                          selectedColor === c.label
                            ? "ring-2 ring-offset-2 ring-offset-[#0e0e0e] ring-primary scale-110"
                            : "hover:scale-105"
                        }`}
                        style={{ backgroundColor: c.hex, border: c.hex === "#F5F5F5" ? "1px solid #333" : "none" }}
                      >
                        {selectedColor === c.label && (
                          <FontAwesomeIcon
                            icon={faCheck}
                            className="absolute inset-0 m-auto h-3.5 w-3.5"
                            style={{ color: c.hex === "#F5F5F5" || c.hex === "#CBD5E1" || c.hex === "#CA8A04" ? "#000" : "#fff" }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                  {selectedColor && (
                    <p className="text-xs text-white/40">Couleur sélectionnée : <span className="text-white">{selectedColor}</span></p>
                  )}
                </div>

                {/* Immatriculation */}
                <div className="space-y-2">
                  <FieldLabel>
                    Immatriculation
                    <span className="text-white/25 font-normal text-xs ml-2">  format SIV (ex: AB-123-CD)</span>
                  </FieldLabel>
                  <div className="relative">
                    <StyledInput
                      id="licensePlate"
                      placeholder="AB-123-CD"
                      value={plateInput}
                      maxLength={9}
                      className={`uppercase tracking-widest font-mono pr-10 ${
                        plateValid === true  ? "border-green-500/60" :
                        plateValid === false ? "border-destructive/60" : ""
                      }`}
                      onChange={(e) => handlePlateChange(e.target.value)}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      {plateValid === true  && <FontAwesomeIcon icon={faCheck}              className="h-3.5 w-3.5 text-green-500" />}
                      {plateValid === false && <FontAwesomeIcon icon={faTriangleExclamation} className="h-3.5 w-3.5 text-destructive" />}
                    </span>
                  </div>
                  {plateValid === true && (
                    <p className="text-xs text-green-500/80 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faCheck} className="h-3 w-3" />
                      Format valide
                    </p>
                  )}
                  {plateValid === false && (
                    <p className="text-xs text-destructive/80 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faTriangleExclamation} className="h-3 w-3" />
                      Format attendu : AB-123-CD (2 lettres · 3 chiffres · 2 lettres)
                    </p>
                  )}
                  {errors.licensePlate && !plateValid && (
                    <FieldError>{errors.licensePlate.message}</FieldError>
                  )}
                </div>

                {/* VIN */}
                <div className="space-y-2">
                  <FieldLabel>
                    Numéro de série (VIN)
                    <span className="text-white/30 font-normal text-xs ml-2">  optionnel</span>
                  </FieldLabel>
                  <StyledInput
                    id="vin"
                    placeholder="ex. JKAZX4R14XA000001"
                    className="uppercase tracking-widest font-mono text-sm"
                    {...register("vin")}
                  />
                </div>
              </>
            )}

            {/* ── STEP 2 : Achat ── */}
            {step === 2 && (
              <>
                <SectionTitle>Informations d'achat <span className="text-white/30 font-normal text-sm">(optionnel)</span></SectionTitle>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <FieldLabel>Date d'achat</FieldLabel>
                    <StyledInput id="purchaseDate" type="date" {...register("purchaseDate")} />
                  </div>
                  <div className="space-y-2">
                    <FieldLabel>Prix d'achat</FieldLabel>
                    <div className="relative">
                      <StyledInput
                        id="purchasePrice"
                        type="number"
                        min="0"
                        step="100"
                        placeholder="0"
                        {...register("purchasePrice")}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/30 font-medium pointer-events-none">€</span>
                    </div>
                  </div>
                </div>

                {/* Récap */}
                <div className="mt-4 p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/30 mb-3">Récapitulatif</p>
                  <RecapRow label="Marque"       value={watch("brand")} />
                  <RecapRow label="Modèle"       value={watch("model")} />
                  <RecapRow label="Année"        value={String(watch("year"))} />
                  <RecapRow label="Kilométrage"  value={`${Number(watch("currentMileage")).toLocaleString()} km`} />
                  {selectedColor && <RecapRow label="Couleur" value={selectedColor} />}
                  {watch("licensePlate") && <RecapRow label="Immatriculation" value={watch("licensePlate") ?? ""} />}
                </div>

                {error && (
                  <p className="text-sm text-destructive font-medium bg-destructive/10 px-4 py-2 rounded-lg">{error}</p>
                )}
              </>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-6">
            <button
              type="button"
              onClick={() => step === 0 ? router.back() : setStep((s) => s - 1)}
              className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors px-4 py-2 rounded-xl hover:bg-white/5"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="h-3 w-3" />
              {step === 0 ? "Annuler" : "Retour"}
            </button>

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={goNext}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-primary/20"
              >
                Suivant
                <FontAwesomeIcon icon={faChevronRight} className="h-3 w-3" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-primary/20"
              >
                <FontAwesomeIcon icon={isSubmitting ? faGaugeHigh : faCheck} className={`h-4 w-4 ${isSubmitting ? "animate-spin" : ""}`} />
                {isSubmitting ? "Enregistrement..." : "Ajouter la moto"}
              </button>
            )}
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

// ── Composants utilitaires ──

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-bold uppercase tracking-widest text-white/40 pb-2 border-b border-white/[0.06]">{children}</h2>;
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="text-sm font-medium text-white/70 flex items-center gap-1">
      {children}
      {required && <span className="text-primary text-xs">*</span>}
    </label>
  );
}

function FieldError({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-destructive">{children}</p>;
}

function RecapRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between text-sm">
      <span className="text-white/40">{label}</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  );
}

import { forwardRef } from "react";

const StyledInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => (
    <input
      ref={ref}
      className={`w-full bg-[#161616] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary transition-colors ${className}`}
      {...props}
    />
  )
);
StyledInput.displayName = "StyledInput";