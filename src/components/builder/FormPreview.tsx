"use client";

import { motion } from "framer-motion";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MeetingTimePicker } from "@/components/ui/meeting-time-picker";
import { Textarea } from "@/components/ui/textarea";
import { availableFonts, getFontFamily } from "@/lib/fonts";
import type { FormData } from "@/types/form";

interface FormPreviewProps {
  formData: FormData;
  onSubmit?: (data: Record<string, any>) => void;
}

export function FormPreview({ formData, onSubmit }: FormPreviewProps) {
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  // Load Google Font if needed
  useEffect(() => {
    if (formData.theme.fontFamily) {
      const font = availableFonts.find(
        (f) => f.value === formData.theme.fontFamily,
      );
      if (font?.type === "google") {
        const link = document.querySelector(
          `link[data-font="${formData.theme.fontFamily}"]`,
        );
        if (!link) {
          const newLink = document.createElement("link");
          newLink.href = `https://fonts.googleapis.com/css2?family=${formData.theme.fontFamily.replace(/\s+/g, "+")}:300,400,500,600,700&display=swap`;
          newLink.rel = "stylesheet";
          newLink.setAttribute("data-font", formData.theme.fontFamily);
          document.head.appendChild(newLink);
        }
      }
    }
  }, [formData.theme.fontFamily]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmit) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formValues);
      setSubmitStatus("success");
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (fieldId: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const renderField = (field: any) => {
    const inputStyle = {
      borderRadius: `${formData.theme.borderRadius}px`,
      backgroundColor: formData.theme.backgroundColor,
      color: formData.theme.textColor,
      borderColor: formData.theme.textColor + "30",
    };

    const commonProps = {
      id: field.id,
      required: field.required,
      placeholder: field.placeholder,
      className: "w-full",
      style: inputStyle,
    };

    switch (field.type) {
      case "text":
      case "email":
      case "phone":
        return (
          <Input
            {...commonProps}
            type={field.type}
            value={formValues[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
          />
        );

      case "url":
        return (
          <Input
            {...commonProps}
            type="url"
            value={formValues[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
          />
        );

      case "email_field":
        return (
          <Input
            {...commonProps}
            type="email"
            value={formValues[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
          />
        );

      case "phone_field":
        return (
          <Input
            {...commonProps}
            type="tel"
            value={formValues[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder="+1 (555) 123-4567"
          />
        );

      case "country":
        return (
          <select
            {...commonProps}
            value={formValues[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-background"
            style={{
              borderColor: formData.theme.primaryColor + "40",
              color: formData.theme.textColor,
            }}
          >
            <option value="">Select your country...</option>
            <option value="US">🇺🇸 United States</option>
            <option value="CA">🇨🇦 Canada</option>
            <option value="GB">🇬🇧 United Kingdom</option>
            <option value="AU">🇦🇺 Australia</option>
            <option value="DE">🇩🇪 Germany</option>
            <option value="FR">🇫🇷 France</option>
            <option value="IT">🇮🇹 Italy</option>
            <option value="ES">🇪🇸 Spain</option>
            <option value="NL">🇳🇱 Netherlands</option>
            <option value="SE">🇸🇪 Sweden</option>
            <option value="NO">🇳🇴 Norway</option>
            <option value="DK">🇩🇰 Denmark</option>
            <option value="FI">🇫🇮 Finland</option>
            <option value="CH">🇨🇭 Switzerland</option>
            <option value="AT">🇦🇹 Austria</option>
            <option value="BE">🇧🇪 Belgium</option>
            <option value="IE">🇮🇪 Ireland</option>
            <option value="NZ">🇳🇿 New Zealand</option>
            <option value="JP">🇯🇵 Japan</option>
            <option value="KR">🇰🇷 South Korea</option>
            <option value="SG">🇸🇬 Singapore</option>
            <option value="HK">🇭🇰 Hong Kong</option>
            <option value="IN">🇮🇳 India</option>
            <option value="CN">🇨🇳 China</option>
            <option value="BR">🇧🇷 Brazil</option>
            <option value="MX">🇲🇽 Mexico</option>
            <option value="AR">🇦🇷 Argentina</option>
            <option value="CL">🇨🇱 Chile</option>
            <option value="CO">🇨🇴 Colombia</option>
            <option value="PE">🇵🇪 Peru</option>
            <option value="ZA">🇿🇦 South Africa</option>
            <option value="NG">🇳🇬 Nigeria</option>
            <option value="EG">🇪🇬 Egypt</option>
            <option value="KE">🇰🇪 Kenya</option>
            <option value="GH">🇬🇭 Ghana</option>
            <option value="MA">🇲🇦 Morocco</option>
            <option value="TN">🇹🇳 Tunisia</option>
            <option value="DZ">🇩🇿 Algeria</option>
            <option value="LY">🇱🇾 Libya</option>
            <option value="SD">🇸🇩 Sudan</option>
            <option value="ET">🇪🇹 Ethiopia</option>
            <option value="UG">🇺🇬 Uganda</option>
            <option value="TZ">🇹🇿 Tanzania</option>
            <option value="RW">🇷🇼 Rwanda</option>
            <option value="MW">🇲🇼 Malawi</option>
            <option value="ZM">🇿🇲 Zambia</option>
            <option value="ZW">🇿🇼 Zimbabwe</option>
            <option value="BW">🇧🇼 Botswana</option>
            <option value="NA">🇳🇦 Namibia</option>
            <option value="LS">🇱🇸 Lesotho</option>
            <option value="SZ">🇸🇿 Eswatini</option>
            <option value="MG">🇲🇬 Madagascar</option>
            <option value="MU">🇲🇺 Mauritius</option>
            <option value="SC">🇸🇨 Seychelles</option>
            <option value="RE">🇷🇪 Réunion</option>
            <option value="YT">🇾🇹 Mayotte</option>
            <option value="KM">🇰🇲 Comoros</option>
            <option value="DJ">🇩🇯 Djibouti</option>
            <option value="SO">🇸🇴 Somalia</option>
            <option value="ER">🇪🇷 Eritrea</option>
            <option value="CF">🇨🇫 Central African Republic</option>
            <option value="TD">🇹🇩 Chad</option>
            <option value="NE">🇳🇪 Niger</option>
            <option value="ML">🇲🇱 Mali</option>
            <option value="BF">🇧🇫 Burkina Faso</option>
            <option value="SN">🇸🇳 Senegal</option>
            <option value="GM">🇬🇲 Gambia</option>
            <option value="GW">🇬🇼 Guinea-Bissau</option>
            <option value="GN">🇬🇳 Guinea</option>
            <option value="SL">🇸🇱 Sierra Leone</option>
            <option value="LR">🇱🇷 Liberia</option>
            <option value="CI">🇨🇮 Côte d'Ivoire</option>
            <option value="GH">🇬🇭 Ghana</option>
            <option value="TG">🇹🇬 Togo</option>
            <option value="BJ">🇧🇯 Benin</option>
            <option value="CV">🇨🇻 Cape Verde</option>
            <option value="ST">🇸🇹 São Tomé and Príncipe</option>
            <option value="GQ">🇬🇶 Equatorial Guinea</option>
            <option value="GA">🇬🇦 Gabon</option>
            <option value="CG">🇨🇬 Republic of the Congo</option>
            <option value="CD">🇨🇩 Democratic Republic of the Congo</option>
            <option value="AO">🇦🇴 Angola</option>
            <option value="CM">🇨🇲 Cameroon</option>
            <option value="CF">🇨🇫 Central African Republic</option>
            <option value="TD">🇹🇩 Chad</option>
            <option value="NE">🇳🇪 Niger</option>
            <option value="NG">🇳🇬 Nigeria</option>
            <option value="SA">🇸🇦 Saudi Arabia</option>
            <option value="AE">🇦🇪 United Arab Emirates</option>
            <option value="QA">🇶🇦 Qatar</option>
            <option value="KW">🇰🇼 Kuwait</option>
            <option value="BH">🇧🇭 Bahrain</option>
            <option value="OM">🇴🇲 Oman</option>
            <option value="YE">🇾🇪 Yemen</option>
            <option value="IQ">🇮🇶 Iraq</option>
            <option value="SY">🇸🇾 Syria</option>
            <option value="LB">🇱🇧 Lebanon</option>
            <option value="JO">🇯🇴 Jordan</option>
            <option value="IL">🇮🇱 Israel</option>
            <option value="PS">🇵🇸 Palestine</option>
            <option value="TR">🇹🇷 Turkey</option>
            <option value="CY">🇨🇾 Cyprus</option>
            <option value="GR">🇬🇷 Greece</option>
            <option value="BG">🇧🇬 Bulgaria</option>
            <option value="RO">🇷🇴 Romania</option>
            <option value="MD">🇲🇩 Moldova</option>
            <option value="UA">🇺🇦 Ukraine</option>
            <option value="BY">🇧🇾 Belarus</option>
            <option value="LT">🇱🇹 Lithuania</option>
            <option value="LV">🇱🇻 Latvia</option>
            <option value="EE">🇪🇪 Estonia</option>
            <option value="RU">🇷🇺 Russia</option>
            <option value="KZ">🇰🇿 Kazakhstan</option>
            <option value="UZ">🇺🇿 Uzbekistan</option>
            <option value="TM">🇹🇲 Turkmenistan</option>
            <option value="TJ">🇹🇯 Tajikistan</option>
            <option value="KG">🇰🇬 Kyrgyzstan</option>
            <option value="AF">🇦🇫 Afghanistan</option>
            <option value="PK">🇵🇰 Pakistan</option>
            <option value="BD">🇧🇩 Bangladesh</option>
            <option value="LK">🇱🇰 Sri Lanka</option>
            <option value="MV">🇲🇻 Maldives</option>
            <option value="BT">🇧🇹 Bhutan</option>
            <option value="NP">🇳🇵 Nepal</option>
            <option value="MM">🇲🇲 Myanmar</option>
            <option value="TH">🇹🇭 Thailand</option>
            <option value="LA">🇱🇦 Laos</option>
            <option value="KH">🇰🇭 Cambodia</option>
            <option value="VN">🇻🇳 Vietnam</option>
            <option value="MY">🇲🇾 Malaysia</option>
            <option value="BN">🇧🇳 Brunei</option>
            <option value="ID">🇮🇩 Indonesia</option>
            <option value="PH">🇵🇭 Philippines</option>
            <option value="TW">🇹🇼 Taiwan</option>
            <option value="MN">🇲🇳 Mongolia</option>
            <option value="KP">🇰🇵 North Korea</option>
            <option value="FJ">🇫🇯 Fiji</option>
            <option value="PG">🇵🇬 Papua New Guinea</option>
            <option value="SB">🇸🇧 Solomon Islands</option>
            <option value="VU">🇻🇺 Vanuatu</option>
            <option value="NC">🇳🇨 New Caledonia</option>
            <option value="PF">🇵🇫 French Polynesia</option>
            <option value="WS">🇼🇸 Samoa</option>
            <option value="TO">🇹🇴 Tonga</option>
            <option value="KI">🇰🇮 Kiribati</option>
            <option value="TV">🇹🇻 Tuvalu</option>
            <option value="NR">🇳🇷 Nauru</option>
            <option value="PW">🇵🇼 Palau</option>
            <option value="MH">🇲🇭 Marshall Islands</option>
            <option value="FM">🇫🇲 Micronesia</option>
            <option value="CK">🇨🇰 Cook Islands</option>
            <option value="NU">🇳🇺 Niue</option>
            <option value="TK">🇹🇰 Tokelau</option>
            <option value="AS">🇦🇸 American Samoa</option>
            <option value="GU">🇬🇺 Guam</option>
            <option value="MP">🇲🇵 Northern Mariana Islands</option>
            <option value="PR">🇵🇷 Puerto Rico</option>
            <option value="VI">🇻🇮 U.S. Virgin Islands</option>
            <option value="VG">🇻🇬 British Virgin Islands</option>
            <option value="AI">🇦🇮 Anguilla</option>
            <option value="AG">🇦🇬 Antigua and Barbuda</option>
            <option value="DM">🇩🇲 Dominica</option>
            <option value="GD">🇬🇩 Grenada</option>
            <option value="KN">🇰🇳 Saint Kitts and Nevis</option>
            <option value="LC">🇱🇨 Saint Lucia</option>
            <option value="VC">🇻🇨 Saint Vincent and the Grenadines</option>
            <option value="BB">🇧🇧 Barbados</option>
            <option value="TT">🇹🇹 Trinidad and Tobago</option>
            <option value="JM">🇯🇲 Jamaica</option>
            <option value="CU">🇨🇺 Cuba</option>
            <option value="HT">🇭🇹 Haiti</option>
            <option value="DO">🇩🇴 Dominican Republic</option>
            <option value="GT">🇬🇹 Guatemala</option>
            <option value="BZ">🇧🇿 Belize</option>
            <option value="SV">🇸🇻 El Salvador</option>
            <option value="HN">🇭🇳 Honduras</option>
            <option value="NI">🇳🇮 Nicaragua</option>
            <option value="CR">🇨🇷 Costa Rica</option>
            <option value="PA">🇵🇦 Panama</option>
            <option value="GY">🇬🇾 Guyana</option>
            <option value="SR">🇸🇷 Suriname</option>
            <option value="GF">🇬🇫 French Guiana</option>
            <option value="VE">🇻🇪 Venezuela</option>
            <option value="BO">🇧🇴 Bolivia</option>
            <option value="PY">🇵🇾 Paraguay</option>
            <option value="UY">🇺🇾 Uruguay</option>
            <option value="EC">🇪🇨 Ecuador</option>
            <option value="IS">🇮🇸 Iceland</option>
            <option value="GL">🇬🇱 Greenland</option>
            <option value="FO">🇫🇴 Faroe Islands</option>
            <option value="SJ">🇸🇯 Svalbard and Jan Mayen</option>
            <option value="AX">🇦🇽 Åland Islands</option>
            <option value="AD">🇦🇩 Andorra</option>
            <option value="LI">🇱🇮 Liechtenstein</option>
            <option value="MC">🇲🇨 Monaco</option>
            <option value="SM">🇸🇲 San Marino</option>
            <option value="VA">🇻🇦 Vatican City</option>
            <option value="MT">🇲🇹 Malta</option>
            <option value="GI">🇬🇮 Gibraltar</option>
            <option value="IM">🇮🇲 Isle of Man</option>
            <option value="JE">🇯🇪 Jersey</option>
            <option value="GG">🇬🇬 Guernsey</option>
            <option value="FO">🇫🇴 Faroe Islands</option>
            <option value="GL">🇬🇱 Greenland</option>
            <option value="AQ">🇦🇶 Antarctica</option>
            <option value="BV">🇧🇻 Bouvet Island</option>
            <option value="HM">🇭🇲 Heard Island and McDonald Islands</option>
            <option value="TF">🇹🇫 French Southern Territories</option>
            <option value="GS">
              🇬🇸 South Georgia and the South Sandwich Islands
            </option>
            <option value="IO">🇮🇴 British Indian Ocean Territory</option>
            <option value="PN">🇵🇳 Pitcairn Islands</option>
            <option value="SH">🇸🇭 Saint Helena</option>
            <option value="AC">🇦🇨 Ascension Island</option>
            <option value="TA">🇹🇦 Tristan da Cunha</option>
          </select>
        );

      case "textarea":
        return (
          <Textarea
            {...commonProps}
            value={formValues[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            rows={4}
          />
        );

      case "number":
        return (
          <Input
            {...commonProps}
            type="number"
            value={formValues[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
          />
        );

      case "date":
        return (
          <Input
            {...commonProps}
            type="date"
            value={formValues[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
          />
        );

      case "select":
        return (
          <select
            {...commonProps}
            value={formValues[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className="w-full px-3 py-2 border"
          >
            <option value="">Select an option</option>
            {field.options?.map((option: string, index: number) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case "radio":
        return (
          <div className="space-y-2">
            {field.options?.map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`${field.id}-${index}`}
                  name={field.id}
                  value={option}
                  checked={formValues[field.id] === option}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="w-4 h-4"
                  style={{ accentColor: formData.theme.primaryColor }}
                />
                <Label
                  htmlFor={`${field.id}-${index}`}
                  className="text-sm"
                  style={{ color: formData.theme.textColor }}
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      case "checkbox":
        return (
          <div className="space-y-2">
            {field.options?.map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`${field.id}-${index}`}
                  checked={formValues[field.id]?.includes(option) || false}
                  onChange={(e) => {
                    const currentValues = formValues[field.id] || [];
                    if (e.target.checked) {
                      handleInputChange(field.id, [...currentValues, option]);
                    } else {
                      handleInputChange(
                        field.id,
                        currentValues.filter((v: string) => v !== option),
                      );
                    }
                  }}
                  className="w-4 h-4"
                  style={{ accentColor: formData.theme.primaryColor }}
                />
                <Label
                  htmlFor={`${field.id}-${index}`}
                  className="text-sm"
                  style={{ color: formData.theme.textColor }}
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      case "meeting":
        return (
          <MeetingTimePicker
            value={formValues[field.id] || ""}
            onChange={(datetime) => handleInputChange(field.id, datetime)}
            duration={field.meetingSettings?.duration || 30}
            bufferTime={field.meetingSettings?.bufferTime || 0}
            placeholder="Select date and time"
            className="w-full"
          />
        );

      default:
        return (
          <Input
            {...commonProps}
            value={formValues[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
          />
        );
    }
  };

  if (submitStatus === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Thank you!
        </h3>
        <p className="text-muted-foreground">
          {formData.settings.successMessage}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
      style={{
        fontFamily: getFontFamily(formData.theme.fontFamily),
      }}
    >
      <div
        className="p-8 shadow-lg border"
        style={{
          borderRadius: `${formData.theme.borderRadius}px`,
          backgroundColor: formData.theme.backgroundColor,
          color: formData.theme.textColor,
          borderColor: formData.theme.textColor + "20", // 20% opacity
        }}
      >
        {formData.settings.showTitle && (
          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: formData.theme.textColor }}
          >
            {formData.title}
          </h1>
        )}

        {formData.settings.showDescription && formData.description && (
          <p
            className="mb-6 opacity-75"
            style={{ color: formData.theme.textColor }}
          >
            {formData.description}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {formData.fields.map((field) => (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <Label
                htmlFor={field.id}
                className="text-sm font-medium"
                style={{ color: formData.theme.textColor }}
              >
                {field.label}
                {field.required && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </Label>
              {renderField(field)}
            </motion.div>
          ))}

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-3 font-medium transition-all hover:opacity-90"
              style={{
                backgroundColor: formData.theme.primaryColor,
                color: formData.theme.backgroundColor,
                borderRadius: `${formData.theme.borderRadius}px`,
              }}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Submitting...
                </span>
              ) : (
                formData.settings.submitButtonText
              )}
            </button>
          </div>

          {submitStatus === "error" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-destructive text-sm"
            >
              <AlertCircle className="w-4 h-4" />
              There was an error submitting the form. Please try again.
            </motion.div>
          )}
        </form>

        {/* Watermark */}
        {(formData.settings.showWatermark === undefined || formData.settings.showWatermark === true) && (
          <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t opacity-60 transition-opacity">
            <a
              href="https://shelfcue.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 group"
              style={{ fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
            >
              <span className="text-xs text-foreground-muted">
                Powered by
              </span>
              <div className="flex items-center gap-1.5">
                <img
                  src="/1.png"
                  alt="ShelfCue"
                  className="w-4 h-4 object-contain"
                />
                <span
                  className="text-xs font-bold group-hover:underline"
                  style={{ color: formData.theme.textColor }}
                >
                  ShelfCue
                </span>
              </div>
            </a>
          </div>
        )}
      </div>
    </motion.div>
  );
}
