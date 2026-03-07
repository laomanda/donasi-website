import { useEffect, useState } from 'react'
import { useLang } from '../../../lib/i18n'
import { globalDict } from '../../../i18n/global'
import { translate } from '../../../lib/i18n-utils'
import { fetchPublicSettings } from '../../../lib/publicSettings'
import TagService from '../../../services/TagService'
import type { Tag } from '../../../services/TagService'

export function useLandingFooter() {
  const { locale } = useLang()
  const t = (key: string, fallback?: string) => translate(globalDict, locale, key, fallback)
  const [publicSettings, setPublicSettings] = useState<Record<string, string>>({})
  const [tags, setTags] = useState<Tag[]>([])

  useEffect(() => {
    let active = true
    fetchPublicSettings([
      'landing.contact_address',
      'landing.contact_phone',
      'landing.contact_phone_display',
      'landing.contact_phone_link',
      'landing.contact_email',
      'landing.contact_email_link',
      'landing.contact_map_jakarta_embed',
      'landing.contact_map_jakarta_link',
      'landing.social_whatsapp_link',
    ])
      .then((settings) => {
        if (active) setPublicSettings(settings)
      })
      .catch(() => {})

    TagService.getPublic()
      .then((data) => {
        if (active) setTags(data)
      })
      .catch(() => {})

    return () => {
      active = false
    }
  }, [])

  const addressText = publicSettings['landing.contact_address']?.trim() || t('footer.address')
  const addressLines = addressText.split('\n').filter(Boolean)
  const phoneNumber = publicSettings['landing.contact_phone']?.trim() || '0813-1176-8254'
  const phoneDisplay =
    publicSettings['landing.contact_phone_display']?.trim() || `${phoneNumber} (DPF Official)`
  const phoneLink = publicSettings['landing.contact_phone_link']?.trim() || 'https://wa.me/6281311768254'
  const emailText = publicSettings['landing.contact_email']?.trim() || 'layanan@dpf.or.id'
  const emailLink =
    publicSettings['landing.contact_email_link']?.trim() || `https://mail.google.com/mail/?view=cm&fs=1&to=${emailText}`
  const jakartaMapEmbed =
    publicSettings['landing.contact_map_jakarta_embed']?.trim() ||
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63458.32104835289!2d106.80576511303089!3d-6.2446057999999915!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f3804815921d%3A0x6b5d698d11d225a9!2sDPF%20(Djalaludin%20Pane%20Foundation)!5e0!3m2!1sid!2sid!4v1768288510620!5m2!1sid!2sid'
  const jakartaMapLink =
    publicSettings['landing.contact_map_jakarta_link']?.trim() ||
    'https://maps.google.com/?q=-6.24460046114402,106.86403477404349'

  const whatsappLink = publicSettings['landing.social_whatsapp_link']?.trim() || phoneLink

  return {
    locale,
    t,
    tags,
    addressLines,
    phoneDisplay,
    phoneLink,
    emailText,
    emailLink,
    jakartaMapEmbed,
    jakartaMapLink,
    whatsappLink,
    currentYear: new Date().getFullYear(),
  }
}
