"use client";

import { useState, useTransition } from "react";
import { submitQuote } from "@/app/actions/quote";

export default function ContactForm() {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const firstName = data.get("firstName") as string;
    const lastName = data.get("lastName") as string;

    startTransition(async () => {
      const result = await submitQuote({
        productName: `Contact — ${data.get("subject")}`,
        name: `${firstName} ${lastName}`.trim(),
        email: data.get("email") as string,
        phone: data.get("phone") as string,
        message: data.get("message") as string,
      });
      setStatus(result.success ? "success" : "error");
      if (result.success) form.reset();
    });
  }

  if (status === "success") {
    return (
      <div className="contact-form reveal">
        <p style={{ color: "var(--teal-bright)" }}>Message envoyé. Nous vous répondrons rapidement.</p>
      </div>
    );
  }

  return (
    <form className="contact-form reveal" onSubmit={handleSubmit}>
      <div className="row">
        <div className="field">
          <label>Prénom</label>
          <input name="firstName" type="text" placeholder="Prénom" required />
        </div>
        <div className="field">
          <label>Nom</label>
          <input name="lastName" type="text" placeholder="Nom" required />
        </div>
      </div>
      <div className="row">
        <div className="field">
          <label>Email</label>
          <input name="email" type="email" placeholder="email@societe.ma" required />
        </div>
        <div className="field">
          <label>Téléphone</label>
          <input name="phone" type="tel" placeholder="+212 ..." />
        </div>
      </div>
      <div className="field">
        <label>Objet</label>
        <select name="subject">
          <option>Demande de devis</option>
          <option>Disponibilité produit</option>
          <option>Support technique</option>
          <option>Autre</option>
        </select>
      </div>
      <div className="field">
        <label>Message</label>
        <textarea name="message" placeholder="Dites-nous ce dont vous avez besoin..." required />
      </div>
      {status === "error" && (
        <p style={{ color: "#e0554f", fontSize: 13 }}>Erreur. Réessayez svp.</p>
      )}
      <button className="btn" type="submit" disabled={isPending}>
        {isPending ? "Envoi…" : "Envoyer le message"}
      </button>
    </form>
  );
}
