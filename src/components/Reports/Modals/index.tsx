import { ConfigurationModal } from '../ConfigurationModal'
import { CategoriesModal } from '../CategoriesModal'

export interface ModalsType {
  Configuration: typeof ConfigurationModal
  Categories: typeof CategoriesModal
}

const Modals = {} as ModalsType

// Atribuindo subcomponentes ao componente principal
Modals.Configuration = ConfigurationModal
Modals.Categories = CategoriesModal

export { Modals }
