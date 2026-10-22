import { t } from '../utils/browserLanguage'
import { BookmarkView } from './BookmarkView'
import { MaskIcon } from './MaskIcon'

interface HelpViewProps {
  open: boolean
  onClose: () => void
}

/** Aide : guide du grimoire et mentions legales. */
export function HelpView({ open, onClose }: HelpViewProps) {
  return (
    <BookmarkView
      id="help"
      open={open}
      title={t('Aide', 'Help')}
      onClose={onClose}
      className="help-view"
    >
      <div className="help-columns">
        <section>
          <h3>{t('Utiliser le grimoire', 'Using the spellbook')}</h3>
          <ul className="help-list">
            <li>
              <span className="help-icons">
                <MaskIcon file="book-search.svg" />
              </span>
              <span>{t(
                'Recherchez un sort par son nom, en français ou en anglais.',
                'Search a spell by name, in French or English.',
              )}</span>
            </li>
            <li>
              <span className="help-icons">
                <MaskIcon file="funnel.svg" />
              </span>
              <span>{t(
                'Filtres et tri : niveau, classe, école de magie ; liste par ordre alphabétique ou par niveau.',
                'Filters and sort: level, class, school of magic; list alphabetically or by level.',
              )}</span>
            </li>
            <li>
              <span className="help-icons">
                <MaskIcon file="user-round-cog.svg" />
              </span>
              <span>{t(
                'Personnage : créez vos personnages et leurs classes. Les sorts hors de leur portée sont grisés.',
                'Character: create your characters and their classes. Spells out of their reach are greyed out.',
              )}</span>
            </li>
            <li>
              <span className="help-icons">
                <MaskIcon file="eye.svg" />
                <MaskIcon file="eye-off.svg" />
              </span>
              <span>{t(
                'Afficher ou masquer les sorts hors profil (bouton visible dès qu’un personnage a une classe).',
                'Show or hide out-of-profile spells (button shown once a character has a class).',
              )}</span>
            </li>
            <li>
              <span className="help-icons">
                <MaskIcon file="book-heart.svg" />
              </span>
              <span>{t(
                'Grimoire : les sorts que vous avez ajoutés.',
                'Spellbook: the spells you added.',
              )}</span>
            </li>
            <li>
              <span className="help-icons">
                <MaskIcon file="book-plus.svg" />
                <MaskIcon file="book-minus.svg" />
              </span>
              <span>{t(
                'Sur une fiche, ce bouton ajoute le sort au grimoire ou l’en retire. Maintenez-le appuyé pour afficher son libellé.',
                'On a spell sheet, this button adds the spell to the spellbook or removes it. Press and hold it to show its label.',
              )}</span>
            </li>
            <li>
              <span className="help-icons">
                <MaskIcon file="circle-arrow-right.svg" />
              </span>
              <span>{t(
                'Touchez un sort pour lire sa fiche (en français ou en anglais). Les flèches tournent les pages ; sur téléphone, glissez pour passer de la liste à la fiche.',
                'Tap a spell to read its sheet (in French or English). The arrows turn the pages; on a phone, swipe between the list and the sheet.',
              )}</span>
            </li>
          </ul>
        </section>

        <section>
          {/* A completer : editeur et hebergeur (mentions obligatoires, LCEN). */}
          <h3>{t('Mentions légales', 'Legal notice')}</h3>
          <p>
            {t('Données des sorts : SRD 5e via ', 'Spell data: 5e SRD via ')}
            <a href="https://www.dnd5eapi.co/" target="_blank" rel="noreferrer">
              dnd5eapi.co
            </a>
            {t(
              ', projet communautaire non affilié à Wizards of the Coast.',
              ', a community project not affiliated with Wizards of the Coast.',
            )}
          </p>
          <p>
            {t(
              'Contient des éléments du System Reference Document 5.1 de Wizards of the Coast LLC, sous licence ',
              'Includes material from the System Reference Document 5.1 by Wizards of the Coast LLC, licensed under ',
            )}
            <a
              href="https://creativecommons.org/licenses/by/4.0/legalcode"
              target="_blank"
              rel="noreferrer"
            >
              Creative Commons CC BY 4.0
            </a>
            .
          </p>
          <p>
            {t(
              "Données personnelles : vos personnages et votre grimoire sont enregistrés uniquement dans votre navigateur. Rien n'est envoyé à un serveur. Effacer les données du site dans votre navigateur les supprime.",
              'Personal data: your characters and spellbook are saved only in your browser. Nothing is sent to a server. Clearing this site’s data in your browser deletes them.',
            )}
          </p>
          <p>
            {t(
              'Polices : OLDWEST et TimeBurner, distribuées gratuitement sur fontspace.com.',
              'Fonts: OLDWEST and TimeBurner, distributed for free on fontspace.com.',
            )}
          </p>
        </section>
      </div>
    </BookmarkView>
  )
}
