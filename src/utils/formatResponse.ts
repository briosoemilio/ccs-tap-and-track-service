export function formatResponse(props: {
  statusCode: number;
  message: string;
  data: any;
}) {
  const { statusCode, message, data = null } = props;
  return {
    statusCode,
    message,
    data,
  };
}
