import { Linking } from 'react-native';
import { BUILD, checkForUpdate } from '../domain/updates';
import { askDialog, showDialog, showNote } from './Dialog';

let busy = false;

/** «Buscar actualizaciones»: mira la última APK publicada en GitHub y, si es más nueva, ofrece descargarla. */
export async function runUpdateCheck(): Promise<void> {
  if (busy) return;
  busy = true;
  showNote('Buscando actualizaciones…');
  const result = await checkForUpdate();
  busy = false;
  if (result.kind === 'current') {
    showNote('Tienes la última versión', BUILD > 0 ? `Compilación ${BUILD}.` : undefined);
    return;
  }
  if (result.kind === 'error') {
    showDialog('No se ha podido comprobar', 'Revisa la conexión a internet y prueba otra vez. Si sigue sin ir, las versiones nuevas también se pueden descargar desde la página de GitHub.', [{ text: 'Vale' }], { icon: 'warning' });
    return;
  }
  const { release } = result;
  const go = await askDialog(
    'Hay una versión nueva',
    `${release.name} (compilación ${release.build}). Se descargará la APK; al abrirla, Android te pedirá permiso para instalarla encima de esta. Tus sellos y jugadores se conservan.`,
    'Descargar',
    { cancel: 'Ahora no', icon: 'spark' },
  );
  if (go) await Linking.openURL(release.apk ?? release.url).catch(() => undefined);
}
