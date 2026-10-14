import { t } from '../utils/browserLanguage'

/** Mention textuelle : le grise seul ne doit pas porter l'information. */
export function OutOfProfileLabel() {
  return <span className="out-of-profile-label">({t('hors profil', 'out of profile')})</span>
}
