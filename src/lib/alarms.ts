import type { Alarms, Specialty } from "./types";

export interface AlarmItem {
  key: string;
  text: string;
  critical: boolean;
}

export interface AlarmSection {
  title: string;
  items: AlarmItem[];
}

export interface SpecialtyAlarmDefinition {
  label: string;
  color: string;
  sections: AlarmSection[];
}

export const alarmDefinitions: Record<Specialty, SpecialtyAlarmDefinition> = {
  pediatria: {
    label: "Pediatría",
    color: "#7C3AED",
    sections: [
      {
        title: "Conciencia y respuesta",
        items: [
          {
            key: "p_no_responde",
            text: "El niño/a no responde cuando le hablo o no reacciona a estímulos",
            critical: true,
          },
          {
            key: "p_muy_dormido",
            text: "Está muy dormido/a, cuesta mucho despertarlo, más de lo normal",
            critical: true,
          },
          {
            key: "p_convulsion",
            text: "Tuvo convulsiones (sacudidas del cuerpo) ahora o hace poco",
            critical: true,
          },
        ],
      },
      {
        title: "Respiración",
        items: [
          {
            key: "p_ahogo",
            text: "Le cuesta mucho respirar, se le mueven mucho las costillas al respirar",
            critical: true,
          },
          {
            key: "p_labios_azules",
            text: "Tiene los labios, lengua o uñas de color azulado o morado",
            critical: true,
          },
          { key: "p_pausas_resp", text: "Se le para la respiración por momentos", critical: true },
        ],
      },
      {
        title: "Circulación y piel",
        items: [
          {
            key: "p_piel_fria",
            text: "La piel está muy fría, pálida o tiene un aspecto marmóreo (como manchas)",
            critical: true,
          },
          {
            key: "p_relleno",
            text: "Al apretar la uña y soltar, tarda más de 2 segundos en recuperar el color rojo",
            critical: false,
          },
          { key: "p_taquicardia", text: "El corazón late muy rápido (se nota en el cuello o pecho)", critical: false },
        ],
      },
      {
        title: "Fiebre y signos graves",
        items: [
          { key: "p_fiebre_bebe", text: "Fiebre en bebé de menos de 3 meses", critical: true },
          {
            key: "p_manchas_piel",
            text: "Tiene manchas rojas/moradas en la piel que NO desaparecen al presionarlas",
            critical: true,
          },
          {
            key: "p_fiebre_malo",
            text: "Fiebre alta con el niño/a muy decaído, sin fuerza, muy enfermo/a",
            critical: false,
          },
        ],
      },
      {
        title: "Digestivo",
        items: [
          { key: "p_no_toma", text: "No toma ni agua ni leche, rechazo total de líquidos", critical: false },
          {
            key: "p_ojos_hundidos",
            text: "Tiene los ojos hundidos y no orina o lleva horas sin pañal mojado",
            critical: false,
          },
          { key: "p_vomito_verde", text: "Vómitos de color verdoso (bilis) o muchos vómitos seguidos", critical: false },
          { key: "p_barriga_dolor", text: "Dolor de barriga muy fuerte que no cede", critical: false },
        ],
      },
    ],
  },
  ginecologia: {
    label: "Ginecología",
    color: "#DB2777",
    sections: [
      {
        title: "Sangrado",
        items: [
          { key: "g_sangrado_emb", text: "Tengo sangrado vaginal y estoy embarazada", critical: true },
          {
            key: "g_sangrado_abund",
            text: "Sangrado vaginal abundante (empapa más de una compresa por hora)",
            critical: true,
          },
          {
            key: "g_sangrado_meno",
            text: "Sangrado vaginal y ya no tengo la regla hace muchos años (menopausia)",
            critical: false,
          },
        ],
      },
      {
        title: "Dolor pélvico",
        items: [
          { key: "g_dolor_brusco", text: "Dolor en la parte baja del vientre de inicio súbito, muy intenso", critical: true },
          { key: "g_sin_regla", text: "No tuve la regla, tengo dolor y sangrado - posible embarazo", critical: true },
          { key: "g_fiebre_dolor", text: "Tengo fiebre junto con dolor en la parte baja del vientre", critical: false },
          { key: "g_masa_dolor", text: "Noto un bulto doloroso en la zona pélvica o vientre bajo", critical: false },
        ],
      },
      {
        title: "Estado general",
        items: [
          { key: "g_mareo_desmayo", text: "Me mareé mucho o me desmayé", critical: true },
          { key: "g_palida", text: "Me siento muy pálida, con el corazón acelerado y sudoración fría", critical: true },
          {
            key: "g_flujo_malo",
            text: "Flujo vaginal con muy mal olor o color extraño (verde, grisáceo)",
            critical: false,
          },
          { key: "g_vomitos_dolor", text: "Vómitos persistentes junto con dolor pélvico", critical: false },
        ],
      },
    ],
  },
  cirugia: {
    label: "Cirugía",
    color: "#B45309",
    sections: [
      {
        title: "Abdomen agudo",
        items: [
          { key: "c_dolor_brusco", text: "Dolor de barriga muy fuerte que empezó de repente, como un golpe", critical: true },
          { key: "c_barriga_dura", text: "La barriga está muy rígida y dura al tocarla, como una tabla", critical: true },
          { key: "c_barriga_toca", text: "Cuando toco y suelto la barriga hay mucho dolor (rebote)", critical: true },
        ],
      },
      {
        title: "Vómitos y digestivo",
        items: [
          { key: "c_vomito_verde", text: "Vomitando bilis (color verde) o con olor a heces", critical: true },
          { key: "c_sangre_boca", text: "Vomitando sangre o heces de color negro (como alquitrán)", critical: true },
          { key: "c_barriga_hinch", text: "La barriga está muy hinchada y no escucho ni siento que se mueva", critical: false },
        ],
      },
      {
        title: "Shock y signos graves",
        items: [
          {
            key: "c_mareo_palido",
            text: "Estoy muy pálido/a, con la piel fría y sudando - siento que me desmayo",
            critical: true,
          },
          { key: "c_fiebre_barriga", text: "Tengo fiebre alta junto con dolor de barriga muy fuerte", critical: false },
          { key: "c_herida_mal", text: "Tengo una herida quirúrgica que está muy roja, con pus o huele mal", critical: false },
        ],
      },
    ],
  },
  interna: {
    label: "Medicina Interna",
    color: "#0284C7",
    sections: [
      {
        title: "Emergencias neurológicas y cardíacas",
        items: [
          { key: "i_paralisis", text: "Siento un lado del cuerpo paralizado o adormecido de repente", critical: true },
          {
            key: "i_dolor_pecho",
            text: "Dolor fuerte en el pecho, especialmente si se va al brazo o mandíbula",
            critical: true,
          },
          { key: "i_no_responde", text: "No respondo bien o estoy confundido/a de forma repentina", critical: true },
        ],
      },
      {
        title: "Respiración y oxígeno",
        items: [
          { key: "i_ahogo", text: "Me cuesta mucho respirar, siento que me ahogo en reposo", critical: true },
          { key: "i_labios_azules", text: "Tengo los labios o las puntas de los dedos de color azulado", critical: true },
        ],
      },
      {
        title: "Sangrado y eliminación",
        items: [
          { key: "i_sangre_boca", text: "Vomitando sangre o con heces negras (como alquitrán)", critical: true },
          { key: "i_sangre_orina", text: "Sangre en la orina o no orino nada en todo el día", critical: false },
          { key: "i_hinchazon", text: "Hinchazón muy rápida de piernas, cara o todo el cuerpo", critical: false },
        ],
      },
      {
        title: "Fiebre y estado general",
        items: [
          { key: "i_fiebre_alta", text: "Fiebre muy alta que no baja, me siento muy mal, con temblores", critical: false },
          {
            key: "i_hipotermia",
            text: "Cuerpo muy frío (temperatura por debajo de 35 °C), especialmente en persona mayor",
            critical: false,
          },
          {
            key: "i_palido_frio",
            text: "Estoy muy pálido/a, con la piel fría, sudoración y corazón muy rápido",
            critical: true,
          },
        ],
      },
    ],
  },
};

export function getSpecialtyAlarmDefinition(specialty: Specialty | "") {
  return alarmDefinitions[specialty || "interna"];
}

export function getSelectedAlarmItems(alarms: Alarms, specialty: Specialty | "") {
  return getSpecialtyAlarmDefinition(specialty).sections.flatMap((section) =>
    section.items.filter((item) => alarms[item.key]),
  );
}

export function getAlarmStats(alarms: Alarms, specialty: Specialty | "") {
  const selected = getSelectedAlarmItems(alarms, specialty);

  return {
    alarmCount: selected.length,
    criticalCount: selected.filter((item) => item.critical).length,
  };
}
