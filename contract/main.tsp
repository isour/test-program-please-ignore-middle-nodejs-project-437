import "@typespec/http";
using TypeSpec.Http;
@service(#{ title: "Online Store API" })
namespace OnlineStoreApi;
model Money { amount: int32; currency: string; }
model Category { id: string; slug: string; name: string; }
model Product { id: string; slug: string; name: string; description: string; price: Money; categoryId: string; imageUrl?: string; available: boolean; }
model PageMeta { page: int32; perPage: int32; total: int32; totalPages: int32; }
model ProductPage { items: Product[]; meta: PageMeta; }
model Promo { id: string; title: string; text: string; product: Product; }
model User { id: string; email: string; }
model Credentials { email: string; password: string; }
model CartItem { productId: string; quantity: int32; }
model ShippingDetails { method: string; recipientName: string; phone: string; address?: string; }
model OrderItem { productId: string; productName: string; priceAtPurchase: Money; quantity: int32; }
model Order { id: string; status: string; items: OrderItem[]; shipping: ShippingDetails; total: Money; createdAt: utcDateTime; }
model OrderInput { items: CartItem[]; shipping: ShippingDetails; }
model Problem { type: string; title: string; status: int32; detail?: string; }
@route("/api") namespace API {
  @get @route("/health") op health(): { status: string };
  @post @route("/users") op register(@body body: Credentials): User;
  @post @route("/session") op login(@body body: Credentials): User;
  @delete @route("/session") op logout(): void;
  @get @route("/me") op me(): User;
  @get @route("/categories") op categories(): Category[];
  @get @route("/promos") op promos(): Promo[];
  @get @route("/products") op products(@query query: { category?: string; q?: string; priceMin?: int32; priceMax?: int32; available?: boolean; page?: int32; perPage?: int32 }): ProductPage;
  @get @route("/products/{id}") op product(@path id: string): Product;
  @post @route("/orders") op createOrder(@body body: OrderInput): Order;
  @get @route("/orders") op orders(): Order[];
  @get @route("/orders/{id}") op order(@path id: string): Order;
}
