# Verificación automática

- Archivos `.txt` restantes: 0
- Diagramas `.puml`: 34
- Diagramas `.puml` sin `.drawio.xml`: 0



## Verificación posterior

- No quedan líneas con comillas desbalanceadas en los `.puml`.
- Los participantes de los diagramas de interacción ahora usan saltos `\n` dentro de la etiqueta, compatibles con PlantUML.
- Se mantiene la estructura sin archivos `.txt`.


## Verificación v3.3 - Diagramas de interacción

Criterios revisados:

- Uso de `actor` para usuarios/administradores/estudiantes.
- Uso de líneas de vida verticales y barras de activación.
- Mensajes síncronos con flecha sólida.
- Mensajes asíncronos con flecha abierta.
- Respuestas con línea punteada.
- Uso de fragmentos UML `alt`, `opt` y `par` cuando el flujo contiene condiciones o concurrencia.
- Respuesta final hacia la vista o actor en los casos de uso principales.
- XML de draw.io con estructura raíz válida (`mxCell id="0"` y `mxCell id="1" parent="0"`).
