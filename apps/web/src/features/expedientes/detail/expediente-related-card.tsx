import {
  Button,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

interface RelatedEntry {
  id: string;
  primary: string;
  secondary: string;
}

interface ExpedienteRelatedCardProps {
  title: string;
  count: number;
  canRead: boolean;
  linkTo: string;
  noAccessMessage: string;
  emptyMessage: string;
  entries: RelatedEntry[];
}

export function ExpedienteRelatedCard({
  title,
  count,
  canRead,
  linkTo,
  noAccessMessage,
  emptyMessage,
  entries,
}: ExpedienteRelatedCardProps) {
  return (
    <Card>
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 1 }}
        >
          <Typography variant="h3">
            {title} ({count})
          </Typography>
          <Button size="small" component={RouterLink} to={linkTo} disabled={!canRead}>
            Ver todos
          </Button>
        </Stack>
        <Divider />
        {!canRead ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            {noAccessMessage}
          </Typography>
        ) : entries.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            {emptyMessage}
          </Typography>
        ) : (
          <List dense disablePadding>
            {entries.slice(0, 5).map((entry) => (
              <ListItem key={entry.id} disableGutters>
                <ListItemText primary={entry.primary} secondary={entry.secondary} />
              </ListItem>
            ))}
            {entries.length > 5 ? (
              <Typography variant="caption" color="text.secondary" sx={{ pl: 2 }}>
                y {entries.length - 5} más...
              </Typography>
            ) : null}
          </List>
        )}
      </CardContent>
    </Card>
  );
}
